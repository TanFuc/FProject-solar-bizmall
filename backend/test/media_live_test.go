package test

import (
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/identity"
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// Opt-in live test: existing local user permissions, short-lived in-memory token,
// real upload route/R2 storage, isolated QA page unpublished in cleanup. No password changes.
func TestLocalR2MediaAndPublication(t *testing.T) {
	if os.Getenv("BMSOLAR_RUN_MEDIA_LIVE_TEST") != "1" {
		t.Skip("opt-in local R2 integration")
	}
	backend, err := filepath.Abs("..")
	if err != nil {
		t.Fatal(err)
	}
	previous, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err = os.Chdir(backend); err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := os.Chdir(previous); err != nil {
			t.Error(err)
		}
	}()
	cfg := config.Load()
	if cfg.DBDriver != "sqlite" || cfg.Env == "production" {
		t.Fatal("live test is restricted to local SQLite development")
	}
	db, err := database.Connect(cfg, slog.Default())
	if err != nil {
		t.Fatal(err)
	}
	var users []models.User
	if err = db.Preload("Roles.Permissions").Where("status = ?", "active").Find(&users).Error; err != nil {
		t.Fatal(err)
	}
	t.Logf("Existing active local users: %d", len(users))
	var actor *identity.AuthUser
	for index := range users {
		candidate := identity.BuildAuthUser(&users[index])
		createAllowed, publishAllowed := false, false
		for _, role := range candidate.Roles {
			if role == "super_admin" {
				actor = candidate
				break
			}
		}
		for _, permission := range candidate.Permissions {
			if permission == "cms.page.create" {
				createAllowed = true
			}
			if permission == "cms.page.publish" {
				publishAllowed = true
			}
			if permission == "*" {
				actor = candidate
				break
			}
		}
		if createAllowed && publishAllowed {
			actor = candidate
		}
		if actor != nil {
			break
		}
	}
	if actor == nil {
		t.Fatal("existing local administrator required; no user was created")
	}
	cfg.JWTAccessTTLSeconds = 120
	cfg.JWTRefreshTTLSeconds = 120
	token, _, err := identity.GenerateTokens(cfg, actor)
	if err != nil {
		t.Fatal("unable to initialize short-lived test session")
	}
	client := &http.Client{Timeout: 30 * time.Second}
	base := "http://127.0.0.1:3001/api/v1"
	request := func(method, path, contentType string, body io.Reader, authenticated bool) (int, []byte) {
		t.Helper()
		req, err := http.NewRequest(method, base+path, body)
		if err != nil {
			t.Fatal(err)
		}
		if authenticated {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		if contentType != "" {
			req.Header.Set("Content-Type", contentType)
		}
		time.Sleep(250 * time.Millisecond)
		res, err := client.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer res.Body.Close()
		data, err := io.ReadAll(res.Body)
		if err != nil {
			t.Fatal(err)
		}
		return res.StatusCode, data
	}
	// Recover earlier test-only publications if a previous run was interrupted.
	var abandoned []models.Page
	if err := db.Where("page_key LIKE ? AND title = ? AND publication_state = ?", "visual-qa-%", "Visual media QA (draft after test)", "published").Find(&abandoned).Error; err != nil {
		t.Fatal(err)
	}
	for _, page := range abandoned {
		status, _ := request(http.MethodPost, "/admin/pages/"+page.ID+"/unpublish", "application/json", bytes.NewBufferString("{}"), true)
		if status != 200 {
			t.Fatalf("previous QA cleanup returned %d", status)
		}
	}
	status, _ := request(http.MethodPost, "/admin/media/upload", "", nil, false)
	if status != http.StatusUnauthorized {
		t.Fatalf("unauthenticated upload returned %d", status)
	}
	source, err := os.Open("seed-assets/visual-v3/home-illustration.png")
	if err != nil {
		t.Fatal(err)
	}
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", "qa-visual-illustration.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err = io.Copy(part, source); err != nil {
		t.Fatal(err)
	}
	if err = source.Close(); err != nil {
		t.Fatal(err)
	}
	if err = writer.Close(); err != nil {
		t.Fatal(err)
	}
	status, raw := request(http.MethodPost, "/admin/media/upload", writer.FormDataContentType(), &body, true)
	if status != http.StatusCreated {
		t.Fatalf("authenticated upload returned %d", status)
	}
	var uploaded struct {
		Data struct {
			ID       string `json:"id"`
			URL      string `json:"url"`
			Variants []struct {
				URL    string `json:"url"`
				Width  int    `json:"width"`
				Height int    `json:"height"`
			} `json:"variants"`
		} `json:"data"`
	}
	if err = json.Unmarshal(raw, &uploaded); err != nil {
		t.Fatal(err)
	}
	if uploaded.Data.ID == "" || uploaded.Data.URL == "" || len(uploaded.Data.Variants) != 3 {
		t.Fatal("upload response missing registered asset/variants")
	}
	var asset models.MediaAsset
	if err = db.First(&asset, "id = ?", uploaded.Data.ID).Error; err != nil {
		t.Fatal("uploaded asset not persisted")
	}
	if asset.Status != "ready" {
		t.Fatal("uploaded asset not ready")
	}
	urls := []string{uploaded.Data.URL}
	for _, variant := range uploaded.Data.Variants {
		urls = append(urls, variant.URL)
	}
	for index, url := range urls {
		res, err := client.Get(url)
		if err != nil {
			t.Fatal(err)
		}
		actual, _, decodeErr := image.DecodeConfig(res.Body)
		closeErr := res.Body.Close()
		if res.StatusCode != 200 || decodeErr != nil || closeErr != nil {
			t.Fatalf("public image %d is unavailable or invalid", index)
		}
		if index > 0 {
			expected := uploaded.Data.Variants[index-1]
			if actual.Width != expected.Width || actual.Height != expected.Height {
				t.Fatal("variant metadata differs from R2 image bytes")
			}
		}
	}
	stamp := time.Now().Format("20060102150405")
	key := "visual-qa-" + stamp
	heroData, err := json.Marshal(cms.HeroCarouselData{Slides: []cms.HeroSlide{{Title: "Visual media QA", DesktopMediaID: uploaded.Data.ID, MobileMediaID: uploaded.Data.ID}}})
	if err != nil {
		t.Fatal(err)
	}
	blockData, err := json.Marshal([]cms.Block{{ID: "qa_hero", Type: "heroCarousel", Version: 1, Enabled: true, SortOrder: 1, Visibility: "all", Data: heroData}})
	if err != nil {
		t.Fatal(err)
	}
	payload, err := json.Marshal(struct {
		PageKey    string `json:"pageKey"`
		RouteSlug  string `json:"routeSlug"`
		Title      string `json:"title"`
		BlocksJSON string `json:"blocksJson"`
	}{key, "/" + key, "Visual media QA (draft after test)", string(blockData)})
	if err != nil {
		t.Fatal(err)
	}
	status, raw = request(http.MethodPost, "/admin/pages", "application/json", bytes.NewReader(payload), true)
	if status != http.StatusCreated {
		t.Fatalf("create QA page returned %d", status)
	}
	var created struct {
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err = json.Unmarshal(raw, &created); err != nil {
		t.Fatal(err)
	}
	pageID := created.Data.ID
	if pageID == "" {
		t.Fatal("QA page ID missing")
	}
	t.Cleanup(func() {
		status, _ := request(http.MethodPost, "/admin/pages/"+pageID+"/unpublish", "application/json", bytes.NewBufferString("{}"), true)
		if status != 200 {
			t.Errorf("QA page cleanup returned %d", status)
		}
	})
	status, _ = request(http.MethodPost, "/admin/pages/"+pageID+"/publish", "application/json", bytes.NewBufferString("{}"), true)
	if status != 200 {
		t.Fatalf("QA publication returned %d", status)
	}
	status, raw = request(http.MethodGet, "/public/pages/"+key, "", nil, false)
	if status != 200 {
		t.Fatalf("published QA page returned %d", status)
	}
	var published struct {
		Data struct {
			Blocks []cms.Block `json:"blocks"`
		} `json:"data"`
	}
	if err = json.Unmarshal(raw, &published); err != nil {
		t.Fatal(err)
	}
	var actual cms.HeroCarouselData
	if len(published.Data.Blocks) != 1 {
		t.Fatal("unexpected QA block count")
	}
	if err = json.Unmarshal(published.Data.Blocks[0].Data, &actual); err != nil {
		t.Fatal(err)
	}
	if len(actual.Slides) != 1 || actual.Slides[0].DesktopMediaURL != uploaded.Data.URL {
		t.Fatal("published hero did not resolve uploaded media ID to R2 URL")
	}
	// Replacements affect published media without mutating the original revision.
	replacementPath := "/admin/media/" + asset.ID + "/replacement"
	status, _ = request(http.MethodPut, replacementPath, "application/json", bytes.NewBufferString(`{}`), true)
	if status != 400 {
		t.Fatalf("missing replacementId returned %d", status)
	}
	status, _ = request(http.MethodPut, replacementPath, "application/json", bytes.NewBufferString(`{"replacementId":"`+asset.ID+`"}`), true)
	if status != 422 {
		t.Fatalf("self-cycle returned %d", status)
	}
	var target models.MediaAsset
	if err := db.Where("id != ? AND status = ?", asset.ID, "ready").First(&target).Error; err != nil {
		t.Fatal(err)
	}
	readPublished := func() (string, string) {
		t.Helper()
		req, err := http.NewRequest(http.MethodGet, base+"/public/pages/"+key, nil)
		if err != nil {
			t.Fatal(err)
		}
		time.Sleep(250 * time.Millisecond)
		res, err := client.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer res.Body.Close()
		if res.StatusCode != 200 {
			t.Fatalf("QA read: %d", res.StatusCode)
		}
		var value struct {
			Data struct {
				Blocks []cms.Block `json:"blocks"`
			} `json:"data"`
		}
		if err := json.NewDecoder(res.Body).Decode(&value); err != nil {
			t.Fatal(err)
		}
		var hero cms.HeroCarouselData
		if len(value.Data.Blocks) != 1 {
			t.Fatal("QA blocks changed")
		}
		if err := json.Unmarshal(value.Data.Blocks[0].Data, &hero); err != nil {
			t.Fatal(err)
		}
		return hero.Slides[0].DesktopMediaURL, res.Header.Get("ETag")
	}
	originalURL, originalETag := readPublished()
	status, _ = request(http.MethodPut, replacementPath, "application/json", bytes.NewBufferString(`{"replacementId":"`+target.ID+`"}`), true)
	if status != 200 {
		t.Fatalf("replace returned %d", status)
	}
	t.Cleanup(func() {
		status, _ := request(http.MethodPut, replacementPath, "application/json", bytes.NewBufferString(`{"replacementId":null}`), true)
		if status != 200 {
			t.Errorf("restore QA image returned %d", status)
		}
	})
	effectiveURL, newETag := readPublished()
	if effectiveURL == originalURL || newETag == originalETag || newETag == "" {
		t.Fatal("replacement did not update public URL and ETag")
	}
	status, _ = request(http.MethodPut, replacementPath, "application/json", bytes.NewBufferString(`{"replacementId":null}`), true)
	restoredURL, _ := readPublished()
	if status != 200 || restoredURL != originalURL {
		t.Fatal("restore original failed")
	}
	// Existing account with a reduced test session must not gain CMS access.
	restricted := *actor
	restricted.Roles = []string{"sales_agent"}
	restricted.Permissions = []string{"lead.read"}
	restrictedToken, _, err := identity.GenerateTokens(cfg, &restricted)
	if err != nil {
		t.Fatal(err)
	}
	deniedRequest, err := http.NewRequest(http.MethodPut, base+replacementPath, bytes.NewBufferString(`{"replacementId":null}`))
	if err != nil {
		t.Fatal(err)
	}
	deniedRequest.Header.Set("Content-Type", "application/json")
	deniedRequest.Header.Set("Authorization", "Bearer "+restrictedToken)
	time.Sleep(250 * time.Millisecond)
	denied, err := client.Do(deniedRequest)
	if err != nil {
		t.Fatal(err)
	}
	denied.Body.Close()
	if denied.StatusCode != 403 {
		t.Fatalf("restricted session returned %d", denied.StatusCode)
	}
	t.Log("PASS: replacement validation, public URL/ETag refresh, reversible restore, restricted-session 403")
	report := struct {
		UploadStatus               int    `json:"uploadStatus"`
		UnauthenticatedStatus      int    `json:"unauthenticatedStatus"`
		PublicImageStatus          int    `json:"publicImageStatus"`
		Variants                   int    `json:"actualVariantCount"`
		PublicationVerified        bool   `json:"publicationVerified"`
		AssetID                    string `json:"assetId"`
		URL                        string `json:"url"`
		QAPageUnpublishedOnCleanup bool   `json:"qaPageUnpublishedOnCleanup"`
	}{201, 401, 200, 3, true, asset.ID, uploaded.Data.URL, true}
	encoded, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	out := filepath.Join("..", "frontend", "visual-qa", "backend-media-integration.json")
	if err = os.WriteFile(out, encoded, 0644); err != nil {
		t.Fatal(err)
	}
	fmt.Println("PASS: authenticated local upload, real R2 variants, database registration, published media hydration; isolated QA page scheduled for unpublish")
}
