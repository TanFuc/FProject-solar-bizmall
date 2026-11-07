package middleware

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
)

func newTestStore() *database.RedisStore {
	cfg := &config.Config{}
	_, store := database.ConnectRedis(cfg, slog.Default())
	return store
}

func TestRateLimiter_PublicReadBurst(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// External client bursting 50 requests in 1 second should succeed (Burst is 80)
	for i := 0; i < 50; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/public/products", nil)
		req.RemoteAddr = "203.0.113.10:1234"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("request %d failed with code %d, expected 200 within burst allowance", i, rec.Code)
		}
	}
}

func TestRateLimiter_AdminAuthStrictLimit(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Real registered auth endpoint: /api/v1/admin/auth/login
	// ScopeAuth burst is 10. Request 11 must be rejected with 429
	var got429 bool
	for i := 0; i < 15; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth/login", nil)
		req.RemoteAddr = "198.51.100.5:54321"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if i < 10 && rec.Code != http.StatusOK {
			t.Fatalf("auth request %d got %d, expected 200", i, rec.Code)
		}
		if i >= 10 && rec.Code == http.StatusTooManyRequests {
			got429 = true
			if rec.Header().Get("Retry-After") == "" {
				t.Errorf("expected Retry-After header on 429 response")
			}
		}
	}

	if !got429 {
		t.Fatalf("expected rate limiter to reject excessive auth requests with 429")
	}
}

func TestRateLimiter_AuthStrictEvenFromLoopback(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Scope auth BEFORE SSR check: Even when caller is 127.0.0.1, auth must be strictly limited
	var got429 bool
	for i := 0; i < 15; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth/login", nil)
		req.RemoteAddr = "127.0.0.1:54321"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if i >= 10 && rec.Code == http.StatusTooManyRequests {
			got429 = true
			break
		}
	}

	if !got429 {
		t.Fatalf("expected loopback auth requests to be strictly limited at ScopeAuth budget")
	}
}

func TestRateLimiter_LeadsProtection(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Leads burst is 6. Request 7 should be rejected with 429
	var got429 bool
	for i := 0; i < 10; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/public/leads", nil)
		req.RemoteAddr = "198.51.100.99:1111"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if i < 6 && rec.Code != http.StatusOK {
			t.Fatalf("request %d got %d, expected 200", i, rec.Code)
		}
		if i >= 6 && rec.Code == http.StatusTooManyRequests {
			got429 = true
		}
	}

	if !got429 {
		t.Fatalf("expected rate limiter to protect public leads from flood with 429")
	}
}

func TestRateLimiter_SSRLocalhostBurst(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// SSR from 127.0.0.1 making 100 concurrent-like GET requests should succeed (Burst is 200)
	for i := 0; i < 100; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/public/site-shell", nil)
		req.RemoteAddr = "127.0.0.1:45678"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("SSR request %d unexpectedly limited with code %d", i, rec.Code)
		}
	}
}

func TestRateLimiter_SpoofedXForwardedForIgnoredFromExternal(t *testing.T) {
	store := newTestStore()
	handler := RateLimiter(store, 40)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// An external attacker attempting to spoof XFF to bypass limits
	// The limiter should key on actual RemoteAddr (203.0.113.50), ignoring spoofed XFF
	for i := 0; i < 7; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/public/leads", nil)
		req.RemoteAddr = "203.0.113.50:4444"
		req.Header.Set("X-Forwarded-For", "8.8.8."+string(rune('0'+i))) // Spoofed random IPs
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if i == 6 && rec.Code != http.StatusTooManyRequests {
			t.Fatalf("expected request 7 to be blocked despite spoofed XFF headers, got %d", rec.Code)
		}
	}
}
