package catalog

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
	"bmsolar-backend/internal/common/richcontent"
	"bmsolar-backend/internal/common/slug"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"
	"bmsolar-backend/internal/modules/media"

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
	// Public catalog routes
	r.Get("/public/brands", h.GetPublicBrands)
	r.Get("/public/product-categories", h.GetPublicCategories)
	r.Get("/public/audiences", h.GetPublicAudiences)
	r.Get("/public/products", h.ListPublicProducts)
	r.Get("/public/products/{slug}", h.GetPublicProductDetail)

	// Admin catalog routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))

		// Categories
		pr.Get("/admin/product-categories", h.AdminListCategories)
		pr.Post("/admin/product-categories", h.AdminCreateCategory)
		pr.Put("/admin/product-categories/{id}", h.AdminUpdateCategory)
		pr.Delete("/admin/product-categories/{id}", h.AdminDeleteCategory)

		// Brands
		pr.Get("/admin/brands", h.AdminListBrands)
		pr.Post("/admin/brands", h.AdminCreateBrand)
		pr.Put("/admin/brands/{id}", h.AdminUpdateBrand)
		pr.Delete("/admin/brands/{id}", h.AdminDeleteBrand)

		// Products
		pr.Get("/admin/products", h.AdminListProducts)
		pr.Post("/admin/products", h.AdminCreateProduct)
		pr.Get("/admin/products/{id}", h.AdminGetProduct)
		pr.Put("/admin/products/{id}", h.AdminUpdateProduct)
		pr.Delete("/admin/products/{id}", h.AdminDeleteProduct)
		pr.Post("/admin/products/{id}/publish", h.AdminPublishProduct)
		pr.Post("/admin/products/{id}/unpublish", h.AdminUnpublishProduct)
	})
}

// ---------------- Public Endpoints ----------------

type CategoryPublicDTO struct {
	models.ProductCategory
	ImageURL string `json:"imageUrl,omitempty"`
}
type AudiencePublicDTO struct {
	models.Audience
	ImageURL string `json:"imageUrl,omitempty"`
}

func (h *Handler) GetPublicCategories(w http.ResponseWriter, r *http.Request) {
	var rows []models.ProductCategory
	if err := h.db.Where("status = 'published'").Order("sort_order asc").Find(&rows).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list categories"))
		return
	}
	out := make([]CategoryPublicDTO, 0, len(rows))
	for _, row := range rows {
		url := ""
		if row.MediaID != nil {
			resolved, err := media.ResolvePublicURL(h.db, h.cfg, *row.MediaID)
			if err != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve category media"))
				return
			}
			url = resolved
		}
		out = append(out, CategoryPublicDTO{ProductCategory: row, ImageURL: url})
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Data []CategoryPublicDTO `json:"data"`
	}{out}); err != nil {
		return
	}
}
func (h *Handler) GetPublicAudiences(w http.ResponseWriter, r *http.Request) {
	var rows []models.Audience
	if err := h.db.Where("enabled = true").Order("sort_order asc").Find(&rows).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list audiences"))
		return
	}
	out := make([]AudiencePublicDTO, 0, len(rows))
	for _, row := range rows {
		url := ""
		if row.HeroMediaID != nil {
			resolved, err := media.ResolvePublicURL(h.db, h.cfg, *row.HeroMediaID)
			if err != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve audience media"))
				return
			}
			url = resolved
		}
		out = append(out, AudiencePublicDTO{Audience: row, ImageURL: url})
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Data []AudiencePublicDTO `json:"data"`
	}{out}); err != nil {
		return
	}
}

type ProductCardDTO struct {
	HasEnglish   bool     `json:"hasEnglish"`
	ID           string   `json:"id"`
	SKU          string   `json:"sku"`
	Slug         string   `json:"slug"`
	Name         string   `json:"name"`
	Summary      string   `json:"summary"`
	CategorySlug string   `json:"categorySlug"`
	CategoryName string   `json:"categoryName"`
	BrandName    *string  `json:"brandName,omitempty"`
	CoverURL     *string  `json:"coverUrl,omitempty"`
	Audiences    []string `json:"audiences"`
}

func (h *Handler) ListPublicProducts(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)
	query := r.URL.Query()

	categorySlug := query.Get("category")
	audienceCode := query.Get("audience")
	brandSlug := query.Get("brand")
	search := query.Get("search")
	sortOption := query.Get("sort")

	dbQuery := h.db.Model(&models.Product{}).
		Preload("Category").
		Preload("Brand").
		Preload("Audiences.Audience").
		Where("status = 'published'")

	if categorySlug != "" {
		dbQuery = dbQuery.Where("category_id IN (SELECT id FROM product_categories WHERE slug = ?)", categorySlug)
	}

	if brandSlug != "" {
		dbQuery = dbQuery.Where("brand_id IN (SELECT id FROM brands WHERE slug = ?)", brandSlug)
	}

	if audienceCode != "" {
		dbQuery = dbQuery.Where("id IN (SELECT product_id FROM product_audiences pa JOIN audiences a ON pa.audience_id = a.id WHERE a.code = ?)", audienceCode)
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		dbQuery = dbQuery.Where("LOWER(name) LIKE ? OR LOWER(summary) LIKE ? OR sku LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	switch sortOption {
	case "name_asc":
		dbQuery = dbQuery.Order("name asc")
	case "name_desc":
		dbQuery = dbQuery.Order("name desc")
	default:
		dbQuery = dbQuery.Order("published_at desc")
	}

	var total int64
	dbQuery.Count(&total)

	var products []models.Product
	if err := dbQuery.Offset(p.Offset).Limit(p.PageSize).Find(&products).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to fetch products"))
		return
	}

	cards := make([]ProductCardDTO, 0, len(products))
	for _, prod := range products {
		catSlug, catName := "", ""
		if prod.Category != nil {
			catSlug = prod.Category.Slug
			catName = prod.Category.Name
		}
		var brandName *string
		if prod.Brand != nil {
			brandName = &prod.Brand.Name
		}
		var coverURL *string
		if prod.CoverMediaID != nil {
			url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *prod.CoverMediaID)
			if mediaErr != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
				return
			}
			coverURL = &url
		}
		audCodes := make([]string, 0, len(prod.Audiences))
		for _, pa := range prod.Audiences {
			if pa.Audience != nil {
				audCodes = append(audCodes, pa.Audience.Code)
			}
		}

		if r.URL.Query().Get("locale") == "en-US" && prod.English.Available() {
			prod.Name = models.LocalizedText(prod.Name, prod.English.Title)
			prod.Summary = models.LocalizedText(prod.Summary, prod.English.Summary)
		}
		cards = append(cards, ProductCardDTO{
			HasEnglish:   prod.English.Available(),
			ID:           prod.ID,
			SKU:          prod.SKU,
			Slug:         prod.Slug,
			Name:         prod.Name,
			Summary:      prod.Summary,
			CategorySlug: catSlug,
			CategoryName: catName,
			BrandName:    brandName,
			CoverURL:     coverURL,
			Audiences:    audCodes,
		})
	}

	// Fetch available filter options
	var activeCats []models.ProductCategory
	h.db.Where("status = 'published'").Find(&activeCats)
	var activeBrands []models.Brand
	h.db.Find(&activeBrands)
	var activeAudiences []models.Audience
	h.db.Where("enabled = true").Find(&activeAudiences)

	filters := map[string]any{
		"categories": activeCats,
		"brands":     activeBrands,
		"audiences":  activeAudiences,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[ProductCardDTO]{
		Data:    cards,
		Meta:    pagination.BuildMeta(int(total), p.Page, p.PageSize),
		Filters: filters,
	})
}

func (h *Handler) GetPublicProductDetail(w http.ResponseWriter, r *http.Request) {
	productSlug := chi.URLParam(r, "slug")

	var prod models.Product
	if err := h.db.
		Preload("Category").
		Preload("Brand").
		Preload("Media").
		Preload("Audiences.Audience").
		Where("slug = ? AND status = 'published'", productSlug).
		First(&prod).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Product not found or unpublished"))
		return
	}

	var specs any
	if prod.SpecificationJSON != nil && *prod.SpecificationJSON != "" {
		_ = json.Unmarshal([]byte(*prod.SpecificationJSON), &specs)
	}

	var coverURL *string
	if prod.CoverMediaID != nil {
		url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *prod.CoverMediaID)
		if mediaErr != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
			return
		}
		coverURL = &url
	}

	type ProductDetailResponse struct {
		DocumentJSON   string     `json:"documentJson,omitempty"`
		HasEnglish     bool       `json:"hasEnglish"`
		ID             string     `json:"id"`
		SKU            string     `json:"sku"`
		Slug           string     `json:"slug"`
		Name           string     `json:"name"`
		Summary        string     `json:"summary"`
		Description    string     `json:"description"`
		CoverURL       *string    `json:"coverUrl,omitempty"`
		Category       any        `json:"category,omitempty"`
		Brand          any        `json:"brand,omitempty"`
		Specifications any        `json:"specifications,omitempty"`
		Audiences      []string   `json:"audiences"`
		Gallery        []string   `json:"gallery"`
		PublishedAt    *time.Time `json:"publishedAt,omitempty"`
	}

	audCodes := make([]string, 0, len(prod.Audiences))
	for _, pa := range prod.Audiences {
		if pa.Audience != nil {
			audCodes = append(audCodes, pa.Audience.Code)
		}
	}

	gallery := make([]string, 0, len(prod.Media))
	for _, m := range prod.Media {
		url, err := media.ResolvePublicURL(h.db, h.cfg, m.MediaID)
		if err != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
			return
		}
		if url != "" {
			gallery = append(gallery, url)
		}
	}

	if r.URL.Query().Get("locale") == "en-US" && prod.English.Available() {
		prod.Name = models.LocalizedText(prod.Name, prod.English.Title)
		prod.Summary = models.LocalizedText(prod.Summary, prod.English.Summary)
		prod.Description = models.LocalizedText(prod.Description, prod.English.Body)
	}
	resolvedContent, resolveErr := media.ResolveRichContent(h.db, h.cfg, prod.Description)
	if resolveErr != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to resolve document"))
		return
	}
	plainDescription, hasDocument := richcontent.PlainText(resolvedContent)
	var documentJSON string
	if hasDocument {
		documentJSON = resolvedContent
	}
	resp := ProductDetailResponse{
		HasEnglish:     prod.English.Available(),
		ID:             prod.ID,
		SKU:            prod.SKU,
		Slug:           prod.Slug,
		Name:           prod.Name,
		Summary:        prod.Summary,
		Description:    plainDescription,
		DocumentJSON:   documentJSON,
		CoverURL:       coverURL,
		Category:       prod.Category,
		Brand:          prod.Brand,
		Specifications: specs,
		Audiences:      audCodes,
		Gallery:        gallery,
		PublishedAt:    prod.PublishedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": resp,
	})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) AdminListCategories(w http.ResponseWriter, r *http.Request) {
	var cats []models.ProductCategory
	h.db.Order("sort_order asc").Find(&cats)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": cats})
}

func (h *Handler) AdminCreateCategory(w http.ResponseWriter, r *http.Request) {
	var c models.ProductCategory
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	if c.Name == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Category name is required"))
		return
	}

	c.ID = id.New()
	if c.Slug == "" {
		c.Slug = slug.Make(c.Name)
	}
	if c.Locale == "" {
		c.Locale = "vi-VN"
	}
	if c.Status == "" {
		c.Status = "published"
	}

	if err := h.db.Create(&c).Error; err != nil {
		errors.WriteJSON(w, r, errors.Conflict("CATEGORY_EXISTS", "Category slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": c})
}

func (h *Handler) AdminUpdateCategory(w http.ResponseWriter, r *http.Request) {
	catID := chi.URLParam(r, "id")
	var existing models.ProductCategory
	if err := h.db.Where("id = ?", catID).First(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Category not found"))
		return
	}

	_ = json.NewDecoder(r.Body).Decode(&existing)
	h.db.Save(&existing)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": existing})
}

func (h *Handler) AdminDeleteCategory(w http.ResponseWriter, r *http.Request) {
	catID := chi.URLParam(r, "id")
	var count int64
	h.db.Model(&models.Product{}).Where("category_id = ?", catID).Count(&count)
	if count > 0 {
		errors.WriteJSON(w, r, errors.Conflict("CATEGORY_IN_USE", "Cannot delete category containing products"))
		return
	}

	h.db.Delete(&models.ProductCategory{}, "id = ?", catID)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminListBrands(w http.ResponseWriter, r *http.Request) {
	var brands []models.Brand
	h.db.Order("name asc").Find(&brands)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": brands})
}

func (h *Handler) AdminCreateBrand(w http.ResponseWriter, r *http.Request) {
	var b models.Brand
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	if b.Name == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Brand name is required"))
		return
	}

	b.ID = id.New()
	if b.Slug == "" {
		b.Slug = slug.Make(b.Name)
	}

	if err := h.db.Create(&b).Error; err != nil {
		errors.WriteJSON(w, r, errors.Conflict("BRAND_EXISTS", "Brand slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": b})
}

func (h *Handler) AdminUpdateBrand(w http.ResponseWriter, r *http.Request) {
	brandID := chi.URLParam(r, "id")
	var existing models.Brand
	if err := h.db.Where("id = ?", brandID).First(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Brand not found"))
		return
	}

	_ = json.NewDecoder(r.Body).Decode(&existing)
	h.db.Save(&existing)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": existing})
}

func (h *Handler) AdminDeleteBrand(w http.ResponseWriter, r *http.Request) {
	brandID := chi.URLParam(r, "id")
	h.db.Delete(&models.Brand{}, "id = ?", brandID)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminListProducts(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.Product{}).Count(&total)

	var products []models.Product
	h.db.Preload("Category").Preload("Brand").
		Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&products)

	for index := range products {
		row := &products[index]
		if row.CoverMediaID == nil {
			continue
		}
		url, err := media.ResolvePublicURL(h.db, h.cfg, *row.CoverMediaID)
		if err != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve cover media"))
			return
		}
		row.CoverMediaURL = url
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.Product]{
		Data: products,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

type AdminCreateProductRequest struct {
	English           *models.EnglishContent `json:"english"`
	SKU               string                 `json:"sku"`
	Name              string                 `json:"name"`
	Slug              string                 `json:"slug"`
	CategoryID        string                 `json:"categoryId"`
	BrandID           *string                `json:"brandId"`
	Summary           string                 `json:"summary"`
	Description       string                 `json:"description"`
	CoverMediaID      *string                `json:"coverMediaId"`
	SpecificationJSON *string                `json:"specificationJson"`
	AudienceCodes     []string               `json:"audienceCodes"`
	MediaIDs          []string               `json:"mediaIds"`
}

func (h *Handler) AdminCreateProduct(w http.ResponseWriter, r *http.Request) {
	var req AdminCreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if err := richcontent.Validate(req.Description, req.English.ContentBody()); err != nil {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_DOCUMENT", err.Error()))
		return
	}

	if req.SKU == "" || req.Name == "" || req.CategoryID == "" || req.Summary == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "sku, name, categoryId, and summary are required"))
		return
	}

	prodID := id.New()
	pSlug := req.Slug
	if pSlug == "" {
		pSlug = slug.Make(req.Name)
	}

	prod := models.Product{
		English:           req.English,
		ID:                prodID,
		SKU:               req.SKU,
		Slug:              pSlug,
		Name:              req.Name,
		CategoryID:        req.CategoryID,
		BrandID:           req.BrandID,
		Summary:           req.Summary,
		Description:       req.Description,
		CoverMediaID:      req.CoverMediaID,
		SpecificationJSON: req.SpecificationJSON,
		Status:            "draft",
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&prod).Error; err != nil {
			return err
		}

		for _, code := range req.AudienceCodes {
			var aud models.Audience
			if tx.Where("code = ?", code).First(&aud).Error == nil {
				tx.Create(&models.ProductAudience{ProductID: prodID, AudienceID: aud.ID})
			}
		}

		for idx, mID := range req.MediaIDs {
			tx.Create(&models.ProductMedia{
				ID:        id.New(),
				ProductID: prodID,
				MediaID:   mID,
				SortOrder: idx,
			})
		}
		return identity.AuditContentWrite(tx, r.Context(), "create", "product", prod.ID)
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Conflict("PRODUCT_EXISTS", "SKU or Slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": prod})
}

func (h *Handler) AdminGetProduct(w http.ResponseWriter, r *http.Request) {
	prodID := chi.URLParam(r, "id")
	var prod models.Product
	if err := h.db.Preload("Category").Preload("Brand").Preload("Media").Preload("Audiences.Audience").
		Where("id = ?", prodID).First(&prod).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Product not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": prod})
}

func (h *Handler) AdminUpdateProduct(w http.ResponseWriter, r *http.Request) {
	prodID := chi.URLParam(r, "id")
	var prod models.Product
	if err := h.db.Where("id = ?", prodID).First(&prod).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Product not found"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&prod); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	if err := richcontent.Validate(prod.Description, prod.English.ContentBody()); err != nil {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_DOCUMENT", err.Error()))
		return
	}
	prod.ID = prodID
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&prod).Error; err != nil {
			return err
		}
		return identity.AuditContentWrite(tx, r.Context(), "update", "product", prod.ID)
	}); err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to save content"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": prod})
}

func (h *Handler) AdminDeleteProduct(w http.ResponseWriter, r *http.Request) {
	prodID := chi.URLParam(r, "id")
	h.db.Where("product_id = ?", prodID).Delete(&models.ProductMedia{})
	h.db.Where("product_id = ?", prodID).Delete(&models.ProductAudience{})
	h.db.Delete(&models.Product{}, "id = ?", prodID)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminPublishProduct(w http.ResponseWriter, r *http.Request) {
	prodID := chi.URLParam(r, "id")
	now := time.Now().UTC()

	if err := h.db.Model(&models.Product{}).Where("id = ?", prodID).Updates(map[string]any{
		"status":       "published",
		"published_at": &now,
	}).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to publish product"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"id":     prodID,
			"status": "published",
		},
	})
}

func (h *Handler) AdminUnpublishProduct(w http.ResponseWriter, r *http.Request) {
	prodID := chi.URLParam(r, "id")

	if err := h.db.Model(&models.Product{}).Where("id = ?", prodID).Update("status", "draft").Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to unpublish product"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"id":     prodID,
			"status": "draft",
		},
	})
}

type BrandPublicDTO struct {
	ID      string `json:"id"`
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	LogoURL string `json:"logoUrl,omitempty"`
}

func (h *Handler) GetPublicBrands(w http.ResponseWriter, r *http.Request) {
	var rows []models.Brand
	if err := h.db.Order("name asc").Find(&rows).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list brands"))
		return
	}
	result := make([]BrandPublicDTO, 0, len(rows))
	for _, row := range rows {
		url := ""
		if row.LogoMediaID != nil {
			resolved, err := media.ResolvePublicURL(h.db, h.cfg, *row.LogoMediaID)
			if err != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve brand logo"))
				return
			}
			url = resolved
		}
		result = append(result, BrandPublicDTO{ID: row.ID, Slug: row.Slug, Name: row.Name, LogoURL: url})
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Data []BrandPublicDTO `json:"data"`
	}{result}); err != nil {
		return
	}
}
