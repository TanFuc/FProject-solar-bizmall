package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/database"
)

// RateLimitScope represents different categories of traffic with distinct thresholds
type RateLimitScope string

const (
	ScopeAuth       RateLimitScope = "auth"
	ScopeLeads      RateLimitScope = "leads"
	ScopeMutation   RateLimitScope = "mutation"
	ScopeSSRRead    RateLimitScope = "ssr_read"
	ScopePublicRead RateLimitScope = "public_read"
)

// ScopeConfig defines the sustained RPS and allowable burst capacity for a scope.
// Fixed-Window Architecture: Operates on discrete 1-second fixed windows with independent
// burst ceilings per scope, backed atomically by Redis or thread-safe in-memory store.
// Each second interval allows up to Burst requests, resetting cleanly at the second boundary.
type ScopeConfig struct {
	RPS   int // Nominal sustained rate
	Burst int // Maximum permitted requests in a single 1-second fixed window
}

// defaultScopeConfigs defines principled production limits
var defaultScopeConfigs = map[RateLimitScope]ScopeConfig{
	ScopeAuth:       {RPS: 5, Burst: 10},    // Strict: protect /admin/auth endpoints against brute-force
	ScopeLeads:      {RPS: 3, Burst: 6},     // Strict: protect lead generation CRM from spam floods
	ScopeMutation:   {RPS: 15, Burst: 25},   // Admin / API mutations (POST/PUT/PATCH/DELETE)
	ScopeSSRRead:    {RPS: 120, Burst: 200}, // Internal Next.js SSR / loopback: high burst for component prefetch
	ScopePublicRead: {RPS: 40, Burst: 80},   // Public catalog/page reads: generous burst for fast browsing
}

// RateLimiter returns an HTTP middleware enforcing scoped, fixed-window rate limiting
func RateLimiter(store *database.RedisStore, baseRPS int) func(http.Handler) http.Handler {
	configs := make(map[RateLimitScope]ScopeConfig)
	for k, v := range defaultScopeConfigs {
		configs[k] = v
	}
	if baseRPS > 0 {
		configs[ScopePublicRead] = ScopeConfig{
			RPS:   baseRPS,
			Burst: baseRPS * 2,
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			clientKey, isTrustedSSR := resolveClientIdentity(r)
			scope := determineScope(r, isTrustedSSR)
			cfg := configs[scope]

			sec := time.Now().Unix()
			key := fmt.Sprintf("rl:%s:%s:%d", scope, clientKey, sec)

			count, err := store.IncrAtomic(r.Context(), key, 3*time.Second)
			if err == nil {
				remaining := int64(cfg.Burst) - count
				if remaining < 0 {
					remaining = 0
				}
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(cfg.RPS))
				w.Header().Set("X-RateLimit-Remaining", strconv.FormatInt(remaining, 10))

				if count > int64(cfg.Burst) {
					w.Header().Set("Retry-After", "1")
					errors.WriteJSON(w, r, errors.TooManyRequests("Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau giây lát."))
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

// resolveClientIdentity safely determines caller identity.
// Arbitrary client X-Forwarded-For is strictly IGNORED unless the direct connection
// originates from a verified trusted loopback address (e.g. Next.js SSR running locally).
func resolveClientIdentity(r *http.Request) (string, bool) {
	remoteHost, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		remoteHost = r.RemoteAddr
	}

	isLoopback := isLoopbackHost(remoteHost)

	if isLoopback {
		// Only trusted loopback (internal SSR / local reverse proxy) can forward visitor identity
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			clientIP := strings.TrimSpace(parts[0])
			if clientIP != "" && !isLoopbackHost(clientIP) {
				return clientIP, false
			}
		}
		if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
			clientIP := strings.TrimSpace(xrip)
			if clientIP != "" && !isLoopbackHost(clientIP) {
				return clientIP, false
			}
		}
		// Direct internal SSR caller without forwarded visitor IP
		return "internal:ssr", true
	}

	// External connection: NEVER trust XFF / X-Real-IP to prevent spoofing
	return remoteHost, false
}

func isLoopbackHost(host string) bool {
	if host == "localhost" || host == "127.0.0.1" || host == "::1" {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}

// determineScope maps the HTTP request to the appropriate rate limit scope.
// Critical sensitive endpoints (auth, leads, mutations) are ALWAYS scoped strictly first,
// regardless of whether the request originates from loopback or has proxy headers.
func determineScope(r *http.Request, isTrustedSSR bool) RateLimitScope {
	path := r.URL.Path

	// Real registered auth routes in Chi: /api/v1/admin/auth/login, /api/v1/admin/auth/refresh, etc.
	if strings.HasPrefix(path, "/api/v1/admin/auth") || strings.Contains(path, "/admin/auth") {
		return ScopeAuth
	}

	// Public leads submission: strict protection against CRM spam floods
	if strings.HasPrefix(path, "/api/v1/public/leads") && r.Method == http.MethodPost {
		return ScopeLeads
	}

	// Admin / API mutations: strict protection against write abuse
	if r.Method == http.MethodPost || r.Method == http.MethodPut ||
		r.Method == http.MethodPatch || r.Method == http.MethodDelete {
		return ScopeMutation
	}

	// Public GET reads only: trusted loopback SSR receives dedicated burst allowance
	if isTrustedSSR && r.Method == http.MethodGet {
		return ScopeSSRRead
	}

	return ScopePublicRead
}
