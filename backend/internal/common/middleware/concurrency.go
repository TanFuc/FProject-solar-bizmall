package middleware

import (
	"encoding/json"
	"net/http"
)

// MaxConcurrent limits the maximum number of concurrent requests executing simultaneously
func MaxConcurrent(limit int) func(http.Handler) http.Handler {
	if limit <= 0 {
		return func(next http.Handler) http.Handler {
			return next
		}
	}

	sem := make(chan struct{}, limit)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
				next.ServeHTTP(w, r)
			default:
				w.Header().Set("Content-Type", "application/json; charset=utf-8")
				w.Header().Set("Retry-After", "1")
				w.WriteHeader(http.StatusServiceUnavailable)
				_ = json.NewEncoder(w).Encode(map[string]any{
					"error": map[string]any{
						"code":    "SERVER_BUSY",
						"message": "Máy chủ hiện đang xử lý tối đa tải yêu cầu. Vui lòng thử lại sau giây lát.",
					},
				})
			}
		})
	}
}

