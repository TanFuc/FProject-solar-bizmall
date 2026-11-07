package seo

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
	"bmsolar-backend/internal/common/slug"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	// Public routes
	r.Get("/public/sitemap.xml", ServeSitemap(h.db, h.cfg))
	r.Get("/public/seo/{entityKind}/{entityId}", h.GetPublicSeoMetadata)
	r.Get("/public/redirects/resolve", h.ResolveRedirect)

	// Admin routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))
		pr.Use(identity.RequirePermission("seo.metadata.manage"))

		pr.Get("/admin/seo/{entityKind}/{entityId}", h.GetSeoMetadata)
		pr.Put("/admin/seo/{entityKind}/{entityId}", h.UpdateSeoMetadata)

		// Redirects
		pr.Get("/admin/seo/redirects", h.ListRedirects)
		pr.Post("/admin/seo/redirects", h.CreateRedirect)

		// Generations
		pr.Post("/admin/seo/generations", h.GenerateDraftFromProduct)
		pr.Get("/admin/seo/generations/{id}", h.GetGenerationDraft)
		pr.Post("/admin/seo/generations/{id}/review", h.ReviewGenerationDraft)
		pr.Post("/admin/seo/generations/{id}/convert-to-article", h.ConvertDraftToArticle)
	})
}

// ---------------- Public Endpoints ----------------

func (h *Handler) GetPublicSeoMetadata(w http.ResponseWriter, r *http.Request) {
	entityKind := chi.URLParam(r, "entityKind")
	entityID := chi.URLParam(r, "entityId")

	var meta models.SeoMetadata
	if err := h.db.Where("entity_kind = ? AND entity_id = ? AND status = 'active'", entityKind, entityID).First(&meta).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("SEO metadata not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": meta})
}

func (h *Handler) ResolveRedirect(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		errors.WriteJSON(w, r, errors.BadRequest("MISSING_PARAM", "Query param 'path' is required"))
		return
	}

	var red models.SeoRedirect
	if err := h.db.Where("source_path = ?", path).First(&red).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("No redirect for this path"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"sourcePath": red.SourcePath,
			"targetPath": red.TargetPath,
			"httpStatus": red.HTTPStatus,
		},
	})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) GetSeoMetadata(w http.ResponseWriter, r *http.Request) {
	entityKind := chi.URLParam(r, "entityKind")
	entityID := chi.URLParam(r, "entityId")

	var meta models.SeoMetadata
	if err := h.db.Where("entity_kind = ? AND entity_id = ?", entityKind, entityID).First(&meta).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("SEO metadata not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": meta})
}

func (h *Handler) UpdateSeoMetadata(w http.ResponseWriter, r *http.Request) {
	entityKind := chi.URLParam(r, "entityKind")
	entityID := chi.URLParam(r, "entityId")

	var input struct {
		Title        string  `json:"title"`
		Description  string  `json:"description"`
		CanonicalURL *string `json:"canonicalUrl"`
		Robots       string  `json:"robots"`
		OgMediaID    *string `json:"ogMediaId"`
		SchemaJSON   *string `json:"schemaJson"`
		KeywordsJSON *string `json:"keywordsJson"`
		HashtagsJSON *string `json:"hashtagsJSON"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	var meta models.SeoMetadata
	if err := h.db.Where("entity_kind = ? AND entity_id = ?", entityKind, entityID).First(&meta).Error; err != nil {
		meta = models.SeoMetadata{
			ID:           id.New(),
			EntityKind:   entityKind,
			EntityID:     entityID,
			Title:        input.Title,
			Description:  input.Description,
			CanonicalURL: input.CanonicalURL,
			Robots:       "index,follow",
			OgMediaID:    input.OgMediaID,
			SchemaJSON:   input.SchemaJSON,
			KeywordsJSON: input.KeywordsJSON,
			HashtagsJSON: input.HashtagsJSON,
			Status:       "active",
		}
		if input.Robots != "" {
			meta.Robots = input.Robots
		}
		h.db.Create(&meta)
	} else {
		meta.Title = input.Title
		meta.Description = input.Description
		meta.CanonicalURL = input.CanonicalURL
		if input.Robots != "" {
			meta.Robots = input.Robots
		}
		meta.OgMediaID = input.OgMediaID
		meta.SchemaJSON = input.SchemaJSON
		meta.KeywordsJSON = input.KeywordsJSON
		meta.HashtagsJSON = input.HashtagsJSON
		h.db.Save(&meta)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": meta})
}

func (h *Handler) ListRedirects(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.SeoRedirect{}).Count(&total)

	var list []models.SeoRedirect
	h.db.Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&list)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.SeoRedirect]{
		Data: list,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) CreateRedirect(w http.ResponseWriter, r *http.Request) {
	var input struct {
		SourcePath string `json:"sourcePath"`
		TargetPath string `json:"targetPath"`
		HTTPStatus int    `json:"httpStatus"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if input.SourcePath == "" || input.TargetPath == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "sourcePath and targetPath are required"))
		return
	}

	if input.HTTPStatus == 0 {
		input.HTTPStatus = 301
	}

	user := identity.GetUserFromContext(r.Context())
	var actorID *string
	if user != nil {
		actorID = &user.ID
	}

	red := models.SeoRedirect{
		ID:         id.New(),
		SourcePath: input.SourcePath,
		TargetPath: input.TargetPath,
		HTTPStatus: input.HTTPStatus,
		CreatedBy:  actorID,
	}

	if err := h.db.Create(&red).Error; err != nil {
		errors.WriteJSON(w, r, errors.Conflict("REDIRECT_EXISTS", "A redirect for this sourcePath already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": red})
}

// ---------------- SEO Generation Drafts Pipeline ----------------

func (h *Handler) GenerateDraftFromProduct(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ProductID string `json:"productId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	var prod models.Product
	if err := h.db.Preload("Category").Preload("Brand").Where("id = ?", input.ProductID).First(&prod).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Source product not found"))
		return
	}

	catName := ""
	if prod.Category != nil {
		catName = prod.Category.Name
	}
	brandName := ""
	if prod.Brand != nil {
		brandName = prod.Brand.Name
	}

	// Deterministic generation from canonical facts
	proposedTitle := fmt.Sprintf("Giải pháp %s: Tìm hiểu chi tiết về %s", catName, prod.Name)
	if brandName != "" {
		proposedTitle = fmt.Sprintf("Đánh giá %s %s chính hãng | BM SOLAR", brandName, prod.Name)
	}

	bodyContent := map[string]any{
		"intro":       fmt.Sprintf("Sản phẩm %s thuộc danh mục %s được cung cấp và lắp đặt chính hãng bởi BM SOLAR.", prod.Name, catName),
		"summary":     prod.Summary,
		"description": prod.Description,
		"sku":         prod.SKU,
		"brand":       brandName,
		"category":    catName,
		"callToAction": "Liên hệ BM SOLAR ngay hôm nay để nhận báo giá tư vấn giải pháp tối ưu cho công trình của bạn.",
	}
	bodyJSON, _ := json.Marshal(bodyContent)

	metaDescription := prod.Summary
	if len(metaDescription) > 160 {
		metaDescription = metaDescription[:157] + "..."
	}

	hashtags := []string{"#BMSOLAR", "#DienMatTroi", "#NangLuongMatTroi"}
	if catSlug := slug.Make(catName); catSlug != "" {
		cleanTag := "#" + strings.ReplaceAll(catName, " ", "")
		hashtags = append(hashtags, cleanTag)
	}
	if brandName != "" {
		cleanBrand := "#" + strings.ReplaceAll(brandName, " ", "")
		hashtags = append(hashtags, cleanBrand)
	}

	metadataContent := map[string]any{
		"metaTitle":       fmt.Sprintf("%s | BM SOLAR", prod.Name),
		"metaDescription": metaDescription,
		"canonicalUrl":    fmt.Sprintf("%s/san-pham/%s", h.cfg.WebPublicURL, prod.Slug),
		"keywords":        []string{prod.Name, catName, brandName, "điện mặt trời", "BM SOLAR"},
		"hashtags":        hashtags,
	}
	metadataJSON, _ := json.Marshal(metadataContent)

	draft := models.SeoGenerationDraft{
		ID:            id.New(),
		SourceKind:    "product",
		SourceID:      prod.ID,
		PromptVersion: "v1.0-deterministic",
		ModelName:     "bmsolar-deterministic-facts",
		ProposedTitle: proposedTitle,
		BodyJSON:      string(bodyJSON),
		MetadataJSON:  string(metadataJSON),
		Status:        "draft",
	}

	if err := h.db.Create(&draft).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to record generation draft"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": draft})
}

func (h *Handler) GetGenerationDraft(w http.ResponseWriter, r *http.Request) {
	draftID := chi.URLParam(r, "id")
	var draft models.SeoGenerationDraft
	if err := h.db.Where("id = ?", draftID).First(&draft).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Draft not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": draft})
}

func (h *Handler) ReviewGenerationDraft(w http.ResponseWriter, r *http.Request) {
	draftID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var input struct {
		ProposedTitle *string `json:"proposedTitle"`
		BodyJSON      *string `json:"bodyJson"`
		MetadataJSON  *string `json:"metadataJson"`
		Approve       bool    `json:"approve"`
	}
	_ = json.NewDecoder(r.Body).Decode(&input)

	var draft models.SeoGenerationDraft
	if err := h.db.Where("id = ?", draftID).First(&draft).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Draft not found"))
		return
	}

	now := time.Now().UTC()
	draft.ReviewerID = &user.ID
	draft.ReviewedAt = &now
	if input.ProposedTitle != nil {
		draft.ProposedTitle = *input.ProposedTitle
	}
	if input.BodyJSON != nil {
		draft.BodyJSON = *input.BodyJSON
	}
	if input.MetadataJSON != nil {
		draft.MetadataJSON = *input.MetadataJSON
	}
	if input.Approve {
		draft.Status = "reviewed"
	}

	h.db.Save(&draft)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": draft})
}

func (h *Handler) ConvertDraftToArticle(w http.ResponseWriter, r *http.Request) {
	draftID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var draft models.SeoGenerationDraft
	if err := h.db.Where("id = ?", draftID).First(&draft).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Draft not found"))
		return
	}

	if draft.Status != "reviewed" {
		errors.WriteJSON(w, r, errors.Unprocessable("DRAFT_NOT_REVIEWED",
			"Generation draft must be reviewed and approved before converting to article"))
		return
	}

	artID := id.New()
	aSlug := slug.Make(draft.ProposedTitle)

	var metaMap map[string]any
	_ = json.Unmarshal([]byte(draft.MetadataJSON), &metaMap)
	excerpt, _ := metaMap["metaDescription"].(string)
	if excerpt == "" {
		excerpt = draft.ProposedTitle
	}

	// Always created in 'draft' status — never auto-published!
	article := models.Article{
		ID:              artID,
		Slug:            aSlug,
		Title:           draft.ProposedTitle,
		Excerpt:         excerpt,
		BodyJSON:        draft.BodyJSON,
		Status:          "draft",
		AuthorID:        &user.ID,
		SourceProductID: &draft.SourceID,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&article).Error; err != nil {
			return err
		}
		draft.Status = "converted"
		return tx.Save(&draft).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to convert draft to article"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"articleId": article.ID,
			"slug":      article.Slug,
			"status":    article.Status,
		},
	})
}
