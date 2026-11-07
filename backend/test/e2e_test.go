package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/middleware"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/database/seed"
	"bmsolar-backend/internal/modules/catalog"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/editorial"
	"bmsolar-backend/internal/modules/identity"
	"bmsolar-backend/internal/modules/leads"
	"bmsolar-backend/internal/modules/media"
	"bmsolar-backend/internal/modules/projects"
	"bmsolar-backend/internal/modules/seo"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func setupTestApp(t *testing.T) (http.Handler, *gorm.DB, *config.Config) {
	cfg := &config.Config{
		Port:                 "3001",
		Env:                  "test",
		DatabaseURL:          ":memory:",
		DBDriver:             "sqlite",
		AppBaseURL:           "http://localhost:3001",
		WebPublicURL:         "http://localhost:3000",
		CorsAllowedOrigins:   []string{"*"},
		JWTAccessSecret:      "test_jwt_access_secret_super_secure_32b!",
		JWTRefreshSecret:     "test_jwt_refresh_secret_super_secure_32b!",
		JWTAccessTTLSeconds:  900,
		JWTRefreshTTLSeconds: 604800,
		StorageDir:           t.TempDir(),
	}

	db, err := database.ConnectTestMemory()
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	// Seed minimal realistic data
	if err := seed.SeedAll(db, cfg); err != nil {
		t.Fatalf("failed to seed test db: %v", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)

	// Health
	r.Get("/health/live", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	r.Get("/health/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
	})

	// API v1
	r.Route("/api/v1", func(api chi.Router) {
		identity.NewHandler(db, cfg).RegisterRoutes(api)
		media.NewHandler(db, cfg).RegisterRoutes(api)
		cms.NewHandler(db, cfg).RegisterRoutes(api)
		catalog.NewHandler(db, cfg).RegisterRoutes(api)
		projects.NewHandler(db, cfg).RegisterRoutes(api)
		editorial.NewHandler(db, cfg).RegisterRoutes(api)
		leads.NewHandler(db, cfg).RegisterRoutes(api)
		seo.NewHandler(db, cfg).RegisterRoutes(api)
	})

	return r, db, cfg
}

func getAdminToken(t *testing.T, handler http.Handler) string {
	loginPayload := map[string]string{
		"email":    "admin@bmsolar.vn",
		"password": "Admin@123456",
	}
	body, _ := json.Marshal(loginPayload)
	req := httptest.NewRequest("POST", "/api/v1/admin/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("login failed: %s", rec.Body.String())
	}

	var resp struct {
		Data struct {
			AccessToken string `json:"accessToken"`
		} `json:"data"`
	}
	_ = json.NewDecoder(rec.Body).Decode(&resp)
	return resp.Data.AccessToken
}

func TestHealthEndpoints(t *testing.T) {
	app, _, _ := setupTestApp(t)

	// Live
	req := httptest.NewRequest("GET", "/health/live", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rec.Code)
	}

	// Ready
	reqReady := httptest.NewRequest("GET", "/health/ready", nil)
	recReady := httptest.NewRecorder()
	app.ServeHTTP(recReady, reqReady)
	if recReady.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", recReady.Code)
	}
}

func TestPublicSiteShell(t *testing.T) {
	app, _, _ := setupTestApp(t)

	req := httptest.NewRequest("GET", "/api/v1/public/site-shell", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp struct {
		Data struct {
			Brand struct {
				Name string `json:"name"`
			} `json:"brand"`
			Theme struct {
				Primary string `json:"primary"`
			} `json:"theme"`
			UtilityBar struct {
				Visible bool `json:"visible"`
			} `json:"utilityBar"`
			Navigation []any `json:"navigation"`
		} `json:"data"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("json decode failed: %v", err)
	}

	if resp.Data.Brand.Name == "" {
		t.Errorf("expected brand name to be present")
	}
	if resp.Data.Theme.Primary != "#0D4EA6" {
		t.Errorf("expected primary color #0D4EA6, got %s", resp.Data.Theme.Primary)
	}
}

func TestBranchDiscoveryAndChannels(t *testing.T) {
	app, db, _ := setupTestApp(t)

	var branch models.Branch
	db.Where("slug = 'go-vap'").First(&branch)

	req := httptest.NewRequest("GET", "/api/v1/public/branches/"+branch.ID+"/channels", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var resp struct {
		Data []struct {
			Type      string `json:"type"`
			ActionURL string `json:"actionUrl"`
		} `json:"data"`
	}
	_ = json.NewDecoder(rec.Body).Decode(&resp)

	hasPhone := false
	hasZalo := false
	for _, c := range resp.Data {
		if c.Type == "phone" && c.ActionURL == "tel:+84901234567" {
			hasPhone = true
		}
		if c.Type == "zalo" {
			hasZalo = true
		}
	}

	if !hasPhone {
		t.Errorf("expected phone actionUrl tel:+84901234567, got %+v", resp.Data)
	}
	if !hasZalo {
		t.Errorf("expected zalo channel to be resolved")
	}
}

func TestPublishedPageRetrievalAndETag(t *testing.T) {
	app, _, _ := setupTestApp(t)

	req := httptest.NewRequest("GET", "/api/v1/public/pages/home", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	etag := rec.Header().Get("ETag")
	if etag == "" {
		t.Errorf("expected ETag header on public page response")
	}

	// 304 Not Modified
	reqCached := httptest.NewRequest("GET", "/api/v1/public/pages/home", nil)
	reqCached.Header.Set("If-None-Match", etag)
	recCached := httptest.NewRecorder()
	app.ServeHTTP(recCached, reqCached)

	if recCached.Code != http.StatusNotModified {
		t.Errorf("expected 304 Not Modified, got %d", recCached.Code)
	}

	// Nonexistent page returns 404
	req404 := httptest.NewRequest("GET", "/api/v1/public/pages/nonexistent-xyz", nil)
	rec404 := httptest.NewRecorder()
	app.ServeHTTP(rec404, req404)
	if rec404.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", rec404.Code)
	}
}

func TestProductListingAndFiltering(t *testing.T) {
	app, _, _ := setupTestApp(t)

	// List products
	req := httptest.NewRequest("GET", "/api/v1/public/products?pageSize=5", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var resp struct {
		Data []struct {
			ID   string `json:"id"`
			Slug string `json:"slug"`
		} `json:"data"`
		Meta struct {
			Total int `json:"total"`
		} `json:"meta"`
	}
	_ = json.NewDecoder(rec.Body).Decode(&resp)

	if resp.Meta.Total == 0 || len(resp.Data) == 0 {
		t.Errorf("expected products in catalog")
	}

	// Product Detail
	firstSlug := resp.Data[0].Slug
	reqDetail := httptest.NewRequest("GET", "/api/v1/public/products/"+firstSlug, nil)
	recDetail := httptest.NewRecorder()
	app.ServeHTTP(recDetail, reqDetail)

	if recDetail.Code != http.StatusOK {
		t.Errorf("expected 200 on detail, got %d", recDetail.Code)
	}
}

func TestLeadSubmissionAndIdempotency(t *testing.T) {
	app, db, _ := setupTestApp(t)

	leadPayload := map[string]any{
		"name":                 "Nguyễn Văn An",
		"phone":                "0912345678",
		"message":              "Tôi muốn tư vấn hệ thống điện mặt trời 5kW cho gia đình tại Gò Vấp",
		"privacyConsent":       true,
		"privacyPolicyVersion": "v1.0",
		"sourcePage":           "/san-pham/inverter-hybrid-deye-5kw-1-pha",
	}
	body, _ := json.Marshal(leadPayload)

	idempotencyKey := "idem_key_unique_test_123456"

	// First submission
	req1 := httptest.NewRequest("POST", "/api/v1/public/leads", bytes.NewReader(body))
	req1.Header.Set("Content-Type", "application/json")
	req1.Header.Set("Idempotency-Key", idempotencyKey)
	rec1 := httptest.NewRecorder()
	app.ServeHTTP(rec1, req1)

	if rec1.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d: %s", rec1.Code, rec1.Body.String())
	}

	var resp1 struct {
		Data struct {
			ReferenceCode string `json:"referenceCode"`
		} `json:"data"`
	}
	_ = json.NewDecoder(rec1.Body).Decode(&resp1)
	refCode := resp1.Data.ReferenceCode
	if refCode == "" {
		t.Fatalf("expected referenceCode in response")
	}

	// Second submission with SAME Idempotency-Key
	req2 := httptest.NewRequest("POST", "/api/v1/public/leads", bytes.NewReader(body))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Idempotency-Key", idempotencyKey)
	rec2 := httptest.NewRecorder()
	app.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusOK && rec2.Code != http.StatusCreated {
		t.Fatalf("expected 200/201 on replay, got %d", rec2.Code)
	}

	var resp2 struct {
		Data struct {
			ReferenceCode string `json:"referenceCode"`
		} `json:"data"`
	}
	_ = json.NewDecoder(rec2.Body).Decode(&resp2)

	if resp2.Data.ReferenceCode != refCode {
		t.Errorf("idempotency violated: expected same refCode %s, got %s", refCode, resp2.Data.ReferenceCode)
	}

	// Assert exactly 1 lead was stored in DB
	var leadCount int64
	db.Model(&models.Lead{}).Where("idempotency_key = ?", idempotencyKey).Count(&leadCount)
	if leadCount != 1 {
		t.Errorf("expected exactly 1 lead in database, got %d", leadCount)
	}
}

func TestLeadStateTransitionsAndTerminalReason(t *testing.T) {
	app, db, _ := setupTestApp(t)
	token := getAdminToken(t, app)

	lead := models.Lead{
		ID:                   id.New(),
		RefCode:              "BM-TEST-TRANSITION",
		Name:                 "Khách Hàng Test",
		Phone:                strPtr("+84988776655"),
		Message:              "Cần báo giá",
		SourcePage:           "/",
		ConsentAt:            time.Now(),
		PrivacyPolicyVersion: "v1.0",
		Status:               "new",
	}
	db.Create(&lead)

	// Valid transition: new -> contacted
	trPayload := map[string]any{"toStatus": "contacted", "note": "Đã gọi điện thoại trao đổi"}
	trBody, _ := json.Marshal(trPayload)
	reqTr := httptest.NewRequest("POST", "/api/v1/admin/leads/"+lead.ID+"/transition", bytes.NewReader(trBody))
	reqTr.Header.Set("Authorization", "Bearer "+token)
	reqTr.Header.Set("Content-Type", "application/json")
	recTr := httptest.NewRecorder()
	app.ServeHTTP(recTr, reqTr)

	if recTr.Code != http.StatusOK {
		t.Fatalf("expected 200 on transition, got %d: %s", recTr.Code, recTr.Body.String())
	}

	// Invalid transition: contacted -> won directly (not allowed without qualified, quoted)
	invalidTr := map[string]any{"toStatus": "won"}
	invBody, _ := json.Marshal(invalidTr)
	reqInv := httptest.NewRequest("POST", "/api/v1/admin/leads/"+lead.ID+"/transition", bytes.NewReader(invBody))
	reqInv.Header.Set("Authorization", "Bearer "+token)
	reqInv.Header.Set("Content-Type", "application/json")
	recInv := httptest.NewRecorder()
	app.ServeHTTP(recInv, reqInv)

	if recInv.Code != http.StatusUnprocessableEntity {
		t.Errorf("expected 422 for invalid transition, got %d", recInv.Code)
	}

	// Transition to 'lost' without reason must fail
	lostNoReason := map[string]any{"toStatus": "lost"}
	lostBody, _ := json.Marshal(lostNoReason)
	reqLost := httptest.NewRequest("POST", "/api/v1/admin/leads/"+lead.ID+"/transition", bytes.NewReader(lostBody))
	reqLost.Header.Set("Authorization", "Bearer "+token)
	reqLost.Header.Set("Content-Type", "application/json")
	recLost := httptest.NewRecorder()
	app.ServeHTTP(recLost, reqLost)

	if recLost.Code != http.StatusBadRequest {
		t.Errorf("expected 400 when reason is missing for terminal transition, got %d", recLost.Code)
	}
}

func TestDynamicSitemap(t *testing.T) {
	app, _, _ := setupTestApp(t)

	req := httptest.NewRequest("GET", "/api/v1/public/sitemap.xml", nil)
	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for sitemap, got %d", rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if !bytes.Contains([]byte(contentType), []byte("application/xml")) {
		t.Errorf("expected application/xml content type, got %s", contentType)
	}

	bodyStr := rec.Body.String()
	if !bytes.Contains([]byte(bodyStr), []byte("<urlset")) {
		t.Errorf("expected <urlset> in sitemap")
	}
	if !bytes.Contains([]byte(bodyStr), []byte("/san-pham/")) {
		t.Errorf("expected /san-pham/ URLs in sitemap")
	}
}

func strPtr(s string) *string {
	return &s
}

func TestPhase03_RBACAndAdminAuth(t *testing.T) {
	app, _, _ := setupTestApp(t)

	// 1. Unauthenticated request to protected endpoint returns 401
	reqUnauth := httptest.NewRequest("GET", "/api/v1/admin/auth/me", nil)
	recUnauth := httptest.NewRecorder()
	app.ServeHTTP(recUnauth, reqUnauth)
	if recUnauth.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", recUnauth.Code)
	}

	// 2. Login with valid credentials
	token := getAdminToken(t, app)
	if token == "" {
		t.Fatalf("expected valid JWT token")
	}

	// 3. Authenticated request to /admin/auth/me returns user profile
	reqMe := httptest.NewRequest("GET", "/api/v1/admin/auth/me", nil)
	reqMe.Header.Set("Authorization", "Bearer "+token)
	recMe := httptest.NewRecorder()
	app.ServeHTTP(recMe, reqMe)
	if recMe.Code != http.StatusOK {
		t.Errorf("expected 200 OK for /admin/auth/me, got %d", recMe.Code)
	}
}

func TestPhase06_PagePublishingLifecycle(t *testing.T) {
	app, _, _ := setupTestApp(t)
	token := getAdminToken(t, app)

	// 1. Create page in draft
	pageInput := map[string]any{
		"pageKey":    "gioi-thieu",
		"routeSlug":  "gioi-thieu",
		"title":      "Giới thiệu BM SOLAR",
		"blocksJson": `[{"id":"blk_1","type":"richText","version":1,"enabled":true,"sortOrder":1,"visibility":"all","data":{"htmlSanitized":"<p>BM SOLAR thành lập năm 2018...</p>"}}]`,
	}
	body, _ := json.Marshal(pageInput)
	reqCreate := httptest.NewRequest("POST", "/api/v1/admin/pages", bytes.NewReader(body))
	reqCreate.Header.Set("Authorization", "Bearer "+token)
	reqCreate.Header.Set("Content-Type", "application/json")
	recCreate := httptest.NewRecorder()
	app.ServeHTTP(recCreate, reqCreate)

	if recCreate.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recCreate.Code, recCreate.Body.String())
	}

	var created struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	_ = json.NewDecoder(recCreate.Body).Decode(&created)
	pageID := created.Data.ID

	// 2. Public GET should return 404 because page is still draft
	reqPubDraft := httptest.NewRequest("GET", "/api/v1/public/pages/gioi-thieu", nil)
	recPubDraft := httptest.NewRecorder()
	app.ServeHTTP(recPubDraft, reqPubDraft)
	if recPubDraft.Code != http.StatusNotFound {
		t.Errorf("expected 404 for unpublished draft page, got %d", recPubDraft.Code)
	}

	// 3. Publish page
	reqPub := httptest.NewRequest("POST", "/api/v1/admin/pages/"+pageID+"/publish", nil)
	reqPub.Header.Set("Authorization", "Bearer "+token)
	recPub := httptest.NewRecorder()
	app.ServeHTTP(recPub, reqPub)
	if recPub.Code != http.StatusOK {
		t.Fatalf("expected 200 on publish, got %d", recPub.Code)
	}

	// 4. Public GET should now return 200 OK
	reqPubOK := httptest.NewRequest("GET", "/api/v1/public/pages/gioi-thieu", nil)
	recPubOK := httptest.NewRecorder()
	app.ServeHTTP(recPubOK, reqPubOK)
	if recPubOK.Code != http.StatusOK {
		t.Errorf("expected 200 for published page, got %d", recPubOK.Code)
	}

	// 5. Unpublish page
	reqUnpub := httptest.NewRequest("POST", "/api/v1/admin/pages/"+pageID+"/unpublish", nil)
	reqUnpub.Header.Set("Authorization", "Bearer "+token)
	recUnpub := httptest.NewRecorder()
	app.ServeHTTP(recUnpub, reqUnpub)
	if recUnpub.Code != http.StatusOK {
		t.Fatalf("expected 200 on unpublish, got %d", recUnpub.Code)
	}

	// 6. Public GET should return 404 again
	reqPubDraft2 := httptest.NewRequest("GET", "/api/v1/public/pages/gioi-thieu", nil)
	recPubDraft2 := httptest.NewRecorder()
	app.ServeHTTP(recPubDraft2, reqPubDraft2)
	if recPubDraft2.Code != http.StatusNotFound {
		t.Errorf("expected 404 after unpublish, got %d", recPubDraft2.Code)
	}
}

func TestPhase07_CatalogAdminCRUD(t *testing.T) {
	app, _, _ := setupTestApp(t)
	token := getAdminToken(t, app)

	// Create Category
	catInput := map[string]string{
		"name": "Dây cáp và Phụ kiện DC",
	}
	body, _ := json.Marshal(catInput)
	reqCat := httptest.NewRequest("POST", "/api/v1/admin/product-categories", bytes.NewReader(body))
	reqCat.Header.Set("Authorization", "Bearer "+token)
	reqCat.Header.Set("Content-Type", "application/json")
	recCat := httptest.NewRecorder()
	app.ServeHTTP(recCat, reqCat)

	if recCat.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recCat.Code, recCat.Body.String())
	}

	var catResp struct {
		Data struct {
			ID   string `json:"id"`
			Slug string `json:"slug"`
		} `json:"data"`
	}
	_ = json.NewDecoder(recCat.Body).Decode(&catResp)
	if catResp.Data.Slug != "day-cap-va-phu-kien-dc" {
		t.Errorf("expected slug day-cap-va-phu-kien-dc, got %s", catResp.Data.Slug)
	}
}

func TestPhase10_LeadBranchScoping(t *testing.T) {
	app, db, _ := setupTestApp(t)

	var branchHCM, branchQN models.Branch
	db.Where("slug = 'go-vap'").First(&branchHCM)
	db.Where("slug = 'quy-nhon'").First(&branchQN)

	// Create lead for Quy Nhơn branch
	leadQN := models.Lead{
		ID:                   id.New(),
		RefCode:              "BM-QN-LEAD",
		Name:                 "Khách Hàng Quy Nhơn",
		Phone:                strPtr("+84909112233"),
		Message:              "Cần lắp mái tôn nhà xưởng 100kWp",
		BranchID:             &branchQN.ID,
		SourcePage:           "/chi-nhanh/quy-nhon",
		ConsentAt:            time.Now(),
		PrivacyPolicyVersion: "v1.0",
		Status:               "new",
	}
	db.Create(&leadQN)

	// Login as Sales HCM
	salesLogin := map[string]string{
		"email":    "sales.hcm@bmsolar.vn",
		"password": "Sales@123456",
	}
	sBody, _ := json.Marshal(salesLogin)
	reqS := httptest.NewRequest("POST", "/api/v1/admin/auth/login", bytes.NewReader(sBody))
	reqS.Header.Set("Content-Type", "application/json")
	recS := httptest.NewRecorder()
	app.ServeHTTP(recS, reqS)

	var sResp struct {
		Data struct {
			AccessToken string `json:"accessToken"`
		} `json:"data"`
	}
	_ = json.NewDecoder(recS.Body).Decode(&sResp)
	salesToken := sResp.Data.AccessToken

	// Sales HCM attempts to read Quy Nhơn lead -> MUST return 403 Forbidden!
	reqForbidden := httptest.NewRequest("GET", "/api/v1/admin/leads/"+leadQN.ID, nil)
	reqForbidden.Header.Set("Authorization", "Bearer "+salesToken)
	recForbidden := httptest.NewRecorder()
	app.ServeHTTP(recForbidden, reqForbidden)

	if recForbidden.Code != http.StatusForbidden {
		t.Errorf("branch security violation: expected 403 Forbidden for cross-branch lead access, got %d", recForbidden.Code)
	}
}

func TestPhase11_SEOGenerationsAndDraftPipeline(t *testing.T) {
	app, db, _ := setupTestApp(t)
	token := getAdminToken(t, app)

	var prod models.Product
	db.First(&prod)

	// 1. Generate Draft
	genReq := map[string]string{"productId": prod.ID}
	genBody, _ := json.Marshal(genReq)
	reqGen := httptest.NewRequest("POST", "/api/v1/admin/seo/generations", bytes.NewReader(genBody))
	reqGen.Header.Set("Authorization", "Bearer "+token)
	reqGen.Header.Set("Content-Type", "application/json")
	recGen := httptest.NewRecorder()
	app.ServeHTTP(recGen, reqGen)

	if recGen.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recGen.Code, recGen.Body.String())
	}

	var genResp struct {
		Data struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	_ = json.NewDecoder(recGen.Body).Decode(&genResp)
	draftID := genResp.Data.ID

	if genResp.Data.Status != "draft" {
		t.Errorf("expected initial status 'draft', got %s", genResp.Data.Status)
	}

	// 2. Trying to convert unapproved draft to article must fail with 422
	reqConvFail := httptest.NewRequest("POST", "/api/v1/admin/seo/generations/"+draftID+"/convert-to-article", nil)
	reqConvFail.Header.Set("Authorization", "Bearer "+token)
	recConvFail := httptest.NewRecorder()
	app.ServeHTTP(recConvFail, reqConvFail)
	if recConvFail.Code != http.StatusUnprocessableEntity {
		t.Errorf("expected 422 Unprocessable for unreviewed draft, got %d", recConvFail.Code)
	}

	// 3. Editorial Review & Approval
	revReq := map[string]any{"approve": true}
	revBody, _ := json.Marshal(revReq)
	reqRev := httptest.NewRequest("POST", "/api/v1/admin/seo/generations/"+draftID+"/review", bytes.NewReader(revBody))
	reqRev.Header.Set("Authorization", "Bearer "+token)
	reqRev.Header.Set("Content-Type", "application/json")
	recRev := httptest.NewRecorder()
	app.ServeHTTP(recRev, reqRev)
	if recRev.Code != http.StatusOK {
		t.Fatalf("expected 200 for review, got %d", recRev.Code)
	}

	// 4. Convert approved draft to article (created in draft status)
	reqConv := httptest.NewRequest("POST", "/api/v1/admin/seo/generations/"+draftID+"/convert-to-article", nil)
	reqConv.Header.Set("Authorization", "Bearer "+token)
	recConv := httptest.NewRecorder()
	app.ServeHTTP(recConv, reqConv)

	if recConv.Code != http.StatusCreated {
		t.Fatalf("expected 201 on conversion, got %d: %s", recConv.Code, recConv.Body.String())
	}

	var convResp struct {
		Data struct {
			ArticleID string `json:"articleId"`
			Status    string `json:"status"`
		} `json:"data"`
	}
	_ = json.NewDecoder(recConv.Body).Decode(&convResp)

	if convResp.Data.Status != "draft" {
		t.Errorf("converted article must be in draft status, never auto-published; got %s", convResp.Data.Status)
	}

	// 5. Test 301 Redirect creation and resolve
	redInput := map[string]any{
		"sourcePath": "/san-pham-cu/inverter-cu",
		"targetPath": "/san-pham/inverter-hybrid-deye-5kw-1-pha",
		"httpStatus": 301,
	}
	rBody, _ := json.Marshal(redInput)
	reqRed := httptest.NewRequest("POST", "/api/v1/admin/seo/redirects", bytes.NewReader(rBody))
	reqRed.Header.Set("Authorization", "Bearer "+token)
	reqRed.Header.Set("Content-Type", "application/json")
	recRed := httptest.NewRecorder()
	app.ServeHTTP(recRed, reqRed)
	if recRed.Code != http.StatusCreated {
		t.Fatalf("expected 201 for redirect create, got %d", recRed.Code)
	}

	// Resolve redirect publicly
	reqResolve := httptest.NewRequest("GET", "/api/v1/public/redirects/resolve?path=/san-pham-cu/inverter-cu", nil)
	recResolve := httptest.NewRecorder()
	app.ServeHTTP(recResolve, reqResolve)
	if recResolve.Code != http.StatusOK {
		t.Errorf("expected 200 on resolve redirect, got %d", recResolve.Code)
	}
}
