package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"bmsolar-backend/internal/common/middleware"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/modules/catalog"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/editorial"
	"bmsolar-backend/internal/modules/identity"
	"bmsolar-backend/internal/modules/leads"
	"bmsolar-backend/internal/modules/media"
	"bmsolar-backend/internal/modules/projects"
	"bmsolar-backend/internal/modules/seo"

	"github.com/go-chi/chi/v5"
	"go.uber.org/automaxprocs/maxprocs"
)

func main() {
	cfg := config.Load()

	// Initialize structured JSON logger
	logHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})
	logger := slog.New(logHandler)
	slog.SetDefault(logger)

	// 1. Optimize GOMAXPROCS for Production / Containers
	if cfg.RuntimeGOMAXPROCS > 0 {
		prev := runtime.GOMAXPROCS(cfg.RuntimeGOMAXPROCS)
		logger.Info("runtime_procs_configured_manually",
			slog.Int("gomaxprocs", cfg.RuntimeGOMAXPROCS),
			slog.Int("previous_gomaxprocs", prev),
		)
	} else {
		// Automatically set GOMAXPROCS to match Linux Container CPU quota
		undo, err := maxprocs.Set(maxprocs.Logger(func(format string, args ...any) {
			logger.Info("automaxprocs_optimized", slog.String("msg", fmt.Sprintf(format, args...)))
		}))
		defer undo()
		if err != nil {
			logger.Warn("automaxprocs_detection_warning", slog.Any("error", err))
		}
		logger.Info("runtime_procs_auto_detected", slog.Int("gomaxprocs", runtime.GOMAXPROCS(0)))
	}

	// 2. Application Instance Lock (if configured)
	var lockFile *os.File
	if cfg.AppInstanceLockPath != "" {
		f, err := os.OpenFile(cfg.AppInstanceLockPath, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
		if err != nil {
			logger.Error("instance_lock_failed_another_process_running",
				slog.String("path", cfg.AppInstanceLockPath),
				slog.Any("error", err),
			)
			os.Exit(1)
		}
		lockFile = f
		_, _ = lockFile.WriteString(fmt.Sprintf("%d\n", os.Getpid()))
		logger.Info("instance_lock_acquired", slog.String("path", cfg.AppInstanceLockPath))
	}

	logger.Info("starting_server",
		slog.String("port", cfg.Port),
		slog.String("env", cfg.Env),
		slog.String("database_driver", cfg.DBDriver),
		slog.String("storage_provider", cfg.StorageProvider),
		slog.String("image_base_url", cfg.GetImageBaseURL()),
		slog.Int("rate_limit_rps", cfg.RateLimitRPS),
		slog.Int("max_upload_mb", cfg.MaxUploadMB),
	)

	// 3. Database connection and migrations
	db, err := database.Connect(cfg, logger)
	if err != nil {
		logger.Error("failed_to_initialize_database", slog.Any("error", err))
		os.Exit(1)
	}

	// 4. Redis Client & Caching Store
	redisClient, redisStore := database.ConnectRedis(cfg, logger)
	if redisClient != nil {
		defer redisClient.Close()
	}

	// 5. Router setup
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.ClientIP)
	r.Use(middleware.Logger(logger))
	r.Use(middleware.Recoverer(logger))
	r.Use(middleware.CORS(cfg.CorsAllowedOrigins))

	// Concurrency limiting (if configured > 0)
	if cfg.MaxConcurrentRequests > 0 {
		r.Use(middleware.MaxConcurrent(cfg.MaxConcurrentRequests))
		logger.Info("concurrency_limit_enabled", slog.Int("max_concurrent", cfg.MaxConcurrentRequests))
	}

	// Distributed or in-memory Rate Limiter
	r.Use(middleware.RateLimiter(redisStore, cfg.RateLimitRPS))

	// Health check probes (outside /api)
	r.Get("/health/live", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":    "ok",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	r.Get("/health/ready", func(w http.ResponseWriter, r *http.Request) {
		sqlDB, err := db.DB()
		if err != nil || sqlDB.Ping() != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"status":   "degraded",
				"database": "unreachable",
			})
			return
		}

		redisStatus := "disabled_or_inmemory"
		if redisClient != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 1*time.Second)
			defer cancel()
			if redisClient.Ping(ctx).Err() == nil {
				redisStatus = "connected"
			} else {
				redisStatus = "unreachable"
			}
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status":    "ready",
			"database":  "connected",
			"redis":     redisStatus,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// Public media static delivery (serves local storage)
	mediaHandler := media.NewHandler(db, cfg)
	r.Get("/media/{key}", mediaHandler.ServeFile)

	// API v1 Routes
	r.Route("/api/v1", func(api chi.Router) {
		// Identity & Auth
		identityHandler := identity.NewHandler(db, cfg)
		identityHandler.RegisterRoutes(api)

		// Media
		mediaHandler.RegisterRoutes(api)

		// CMS (Site Shell, Navigation, Theme, Branches, Pages Publishing)
		cmsHandler := cms.NewHandler(db, cfg)
		cmsHandler.RegisterRoutes(api)

		// Product Catalog
		catalogHandler := catalog.NewHandler(db, cfg)
		catalogHandler.RegisterRoutes(api)

		// Projects
		projectsHandler := projects.NewHandler(db, cfg)
		projectsHandler.RegisterRoutes(api)

		// Editorial / Articles
		editorialHandler := editorial.NewHandler(db, cfg)
		editorialHandler.RegisterRoutes(api)

		// Leads CRM
		leadsHandler := leads.NewHandler(db, cfg)
		leadsHandler.RegisterRoutes(api)

		// SEO & Sitemaps
		seoHandler := seo.NewHandler(db, cfg)
		seoHandler.RegisterRoutes(api)
	})

	// Server instance
	addr := fmt.Sprintf(":%s", cfg.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown channel
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info("server_listening", slog.String("addr", addr))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server_fatal_error", slog.Any("error", err))
		}
	}()

	<-shutdownChan
	logger.Info("shutting_down_gracefully")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("server_shutdown_failed", slog.Any("error", err))
	} else {
		logger.Info("server_stopped_cleanly")
	}

	// Release instance lock if acquired
	if lockFile != nil {
		_ = lockFile.Close()
		_ = os.Remove(cfg.AppInstanceLockPath)
		logger.Info("instance_lock_released", slog.String("path", cfg.AppInstanceLockPath))
	}
}
