package test

import (
	"log/slog"
	"testing"
	"time"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/slug"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/identity"
)

// Phase 01 Unit Tests: ULID & Config
func TestPhase01_ULIDAndConfig(t *testing.T) {
	cfg := config.Load()
	if cfg.Port == "" {
		t.Fatalf("expected Port to be configured")
	}

	id1 := id.New()
	id2 := id.New()
	if len(id1) != 26 || len(id2) != 26 {
		t.Fatalf("expected ULID length 26, got %d and %d", len(id1), len(id2))
	}
	if id1 == id2 {
		t.Fatalf("expected unique ULIDs, got duplicate %s", id1)
	}
}

// Phase 02 Unit Tests: Argon2id Hashing & JWT Tokens
func TestPhase02_PasswordHasherAndJWT(t *testing.T) {
	plainPassword := "Bmsolar@Secret2026!"

	hash, err := identity.HashPassword(plainPassword)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if !identity.CheckPassword(plainPassword, hash) {
		t.Fatalf("expected password verification to succeed")
	}

	if identity.CheckPassword("WrongPassword123!", hash) {
		t.Fatalf("expected password verification to fail for incorrect password")
	}

	cfg := config.Load()
	user := &identity.AuthUser{
		ID:          id.New(),
		Email:       "test@bmsolar.vn",
		DisplayName: "Test User",
		Roles:       []string{"editor"},
		Permissions: []string{"cms.page.update"},
	}

	accessToken, refreshToken, err := identity.GenerateTokens(cfg, user)
	if err != nil {
		t.Fatalf("failed to generate tokens: %v", err)
	}
	if accessToken == "" || refreshToken == "" {
		t.Fatalf("expected non-empty tokens")
	}
}

// Phase 06 Unit Tests: CMS Block Validation
func TestPhase06_BlockValidation(t *testing.T) {
	validBlock := &cms.Block{
		ID:         id.New(),
		Type:       "heroCarousel",
		Version:    1,
		Enabled:    true,
		SortOrder:  1,
		Visibility: "all",
		Data:       []byte(`{"slides": [{"title": "Test Title", "desktopMediaId": "media123"}]}`),
	}

	if err := cms.ValidateBlock(validBlock); err != nil {
		t.Fatalf("expected valid block, got error: %v", err)
	}

	unknownBlock := &cms.Block{
		ID:         id.New(),
		Type:       "unknownDangerousBlock",
		Version:    1,
		Enabled:    true,
		SortOrder:  1,
		Visibility: "all",
		Data:       []byte(`{}`),
	}

	if err := cms.ValidateBlock(unknownBlock); err == nil {
		t.Fatalf("expected unknown block type to be rejected")
	}
}

// Phase 11 Unit Tests: Vietnamese Diacritics Removal & Slug Normalization
func TestPhase11_VietnameseSlugGenerator(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{
			input:    "Inverter Deye Hybrid 5kW 1 Pha Hòa Lưới",
			expected: "inverter-deye-hybrid-5kw-1-pha-hoa-luoi",
		},
		{
			input:    "Tấm Pin Năng Lượng Mặt Trời 550W Cao Cấp!",
			expected: "tam-pin-nang-luong-mat-troi-550w-cao-cap",
		},
		{
			input:    "Dự Án Biệt Thự Đảo Quy Nhơn — Bình Định 2026",
			expected: "du-an-biet-thu-dao-quy-nhon-binh-dinh-2026",
		},
	}

	for _, tc := range tests {
		actual := slug.Make(tc.input)
		if actual != tc.expected {
			t.Errorf("slug.Make(%q) = %q, expected %q", tc.input, actual, tc.expected)
		}
	}
}

// Production Image Base URL & Media Resolution Tests
func TestMediaURLResolution(t *testing.T) {
	// Case 1: Default fallback to local AppBaseURL
	cfgDefault := &config.Config{
		AppBaseURL: "http://localhost:3001",
	}
	if expected := "http://localhost:3001/media/asset123.jpg"; cfgDefault.ResolveMediaURL("asset123.jpg") != expected {
		t.Fatalf("expected %s, got %s", expected, cfgDefault.ResolveMediaURL("asset123.jpg"))
	}

	// Case 2: Production IMAGE_BASE_URL (CDN domain, e.g. https://images.bmsolar.vn/storage)
	cfgProd := &config.Config{
		AppBaseURL:   "https://api.bmsolar.vn",
		ImageBaseURL: "https://images.bmsolar.vn/storage",
	}
	if expected := "https://images.bmsolar.vn/storage/asset456.jpg"; cfgProd.ResolveMediaURL("asset456.jpg") != expected {
		t.Fatalf("expected %s, got %s", expected, cfgProd.ResolveMediaURL("asset456.jpg"))
	}

	// Case 3: Absolute URL bypass
	if expected := "https://cdn.partner.com/banner.png"; cfgProd.ResolveMediaURL("https://cdn.partner.com/banner.png") != expected {
		t.Fatalf("expected %s, got %s", expected, cfgProd.ResolveMediaURL("https://cdn.partner.com/banner.png"))
	}
}

// Redis In-Memory Fallback & Atomic Increments
func TestRedisStoreInMemory(t *testing.T) {
	ctx := t.Context()
	cfg := &config.Config{} // Empty redis -> in-memory store
	_, store := database.ConnectRedis(cfg, slog.Default())

	// Test Set & Get
	err := store.Set(ctx, "test_key", "hello_redis", 5*time.Second)
	if err != nil {
		t.Fatalf("unexpected error on Set: %v", err)
	}

	val, err := store.Get(ctx, "test_key")
	if err != nil || val != "hello_redis" {
		t.Fatalf("expected 'hello_redis', got %q (err: %v)", val, err)
	}

	// Test IncrAtomic (for Rate Limiter)
	c1, err := store.IncrAtomic(ctx, "rate_limit_ip", 10*time.Second)
	if err != nil || c1 != 1 {
		t.Fatalf("expected c1=1, got %d (err: %v)", c1, err)
	}
	c2, err := store.IncrAtomic(ctx, "rate_limit_ip", 10*time.Second)
	if err != nil || c2 != 2 {
		t.Fatalf("expected c2=2, got %d (err: %v)", c2, err)
	}

	// Test Delete
	_ = store.Delete(ctx, "test_key")
	_, err = store.Get(ctx, "test_key")
	if err == nil {
		t.Fatalf("expected key to be deleted")
	}
}
