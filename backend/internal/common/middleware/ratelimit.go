package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/database"
)

// RateLimiter enforces distributed rate-limiting via Redis or in-memory fallback
func RateLimiter(store *database.RedisStore, rps int) func(http.Handler) http.Handler {
	if rps <= 0 {
		rps = 10
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := extractIP(r)
			key := fmt.Sprintf("ratelimit:%s:%d", ip, time.Now().Unix())

			count, err := store.IncrAtomic(r.Context(), key, 2*time.Second)
			if err == nil && count > int64(rps) {
				w.Header().Set("Retry-After", "1")
				errors.WriteJSON(w, r, errors.TooManyRequests("Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau giây lát."))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func extractIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

