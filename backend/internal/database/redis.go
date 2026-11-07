package database

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"bmsolar-backend/internal/config"

	"github.com/redis/go-redis/v9"
)

type RedisStore struct {
	client    *redis.Client
	localMu   sync.RWMutex
	localData map[string]inMemoryItem
}

type inMemoryItem struct {
	val       string
	expiresAt time.Time
}

// ConnectRedis initializes a Redis client if configured and available
func ConnectRedis(cfg *config.Config, log *slog.Logger) (*redis.Client, *RedisStore) {
	var opts *redis.Options
	var err error

	if cfg.RedisURL != "" {
		opts, err = redis.ParseURL(cfg.RedisURL)
		if err != nil {
			log.Warn("invalid_redis_url", slog.String("url", cfg.RedisURL), slog.Any("error", err))
		}
	} else if cfg.RedisAddr != "" {
		opts = &redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPassword,
			DB:       cfg.RedisDB,
		}
	}

	store := &RedisStore{
		localData: make(map[string]inMemoryItem),
	}

	if opts != nil {
		opts.DialTimeout = 2 * time.Second
		opts.ReadTimeout = 1 * time.Second
		opts.WriteTimeout = 1 * time.Second

		rdb := redis.NewClient(opts)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		if pingErr := rdb.Ping(ctx).Err(); pingErr != nil {
			log.Warn("redis_ping_failed_falling_back_to_inmemory",
				slog.String("addr", opts.Addr),
				slog.Any("error", pingErr),
			)
			_ = rdb.Close()
		} else {
			log.Info("redis_connected_successfully",
				slog.String("addr", opts.Addr),
				slog.Int("db", opts.DB),
			)
			store.client = rdb
			return rdb, store
		}
	}

	log.Info("redis_not_configured_or_unreachable_using_inmemory_cache")
	return nil, store
}

// Get retrieves cached string by key
func (s *RedisStore) Get(ctx context.Context, key string) (string, error) {
	if s.client != nil {
		return s.client.Get(ctx, key).Result()
	}

	s.localMu.RLock()
	defer s.localMu.RUnlock()

	item, exists := s.localData[key]
	if !exists {
		return "", redis.Nil
	}
	if !item.expiresAt.IsZero() && time.Now().After(item.expiresAt) {
		return "", redis.Nil
	}
	return item.val, nil
}

// Set stores string by key with TTL
func (s *RedisStore) Set(ctx context.Context, key string, val string, ttl time.Duration) error {
	if s.client != nil {
		return s.client.Set(ctx, key, val, ttl).Err()
	}

	s.localMu.Lock()
	defer s.localMu.Unlock()

	var exp time.Time
	if ttl > 0 {
		exp = time.Now().Add(ttl)
	}

	s.localData[key] = inMemoryItem{
		val:       val,
		expiresAt: exp,
	}
	return nil
}

// Delete removes cached key
func (s *RedisStore) Delete(ctx context.Context, key string) error {
	if s.client != nil {
		return s.client.Del(ctx, key).Err()
	}

	s.localMu.Lock()
	defer s.localMu.Unlock()
	delete(s.localData, key)
	return nil
}

// IncrAtomic increments counter with TTL (used for distributed rate limiting)
func (s *RedisStore) IncrAtomic(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	if s.client != nil {
		pipe := s.client.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, ttl)
		_, err := pipe.Exec(ctx)
		if err != nil {
			return 0, err
		}
		return incr.Val(), nil
	}

	s.localMu.Lock()
	defer s.localMu.Unlock()

	item, exists := s.localData[key]
	var count int64 = 1
	now := time.Now()

	if exists && (item.expiresAt.IsZero() || now.Before(item.expiresAt)) {
		var n int64
		_, _ = fmt.Sscanf(item.val, "%d", &n)
		count = n + 1
		s.localData[key] = inMemoryItem{
			val:       fmt.Sprintf("%d", count),
			expiresAt: item.expiresAt,
		}
	} else {
		s.localData[key] = inMemoryItem{
			val:       "1",
			expiresAt: now.Add(ttl),
		}
	}
	return count, nil
}

