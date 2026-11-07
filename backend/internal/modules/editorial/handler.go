package editorial

import (
	"encoding/json"
	"net/http"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
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
	// Public routes
	r.Get("/public/articles", h.ListPublicArticles)
	r.Get("/public/tags", h.ListPublishedTags)
	r.Get("/public/articles/{slug}", h.GetPublicArticleDetail)
	r.Get("/public/tags/{slug}", h.GetPublicTag)

	// Admin routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))

		// Tags
		pr.Get("/admin/tags", h.AdminListTags)
		pr.Post("/admin/tags", h.AdminCreateTag)
		pr.Put("/admin/tags/{id}", h.AdminUpdateTag)
		pr.Delete("/admin/tags/{id}", h.AdminDeleteTag)

		// Articles
		pr.Get("/admin/articles", h.AdminListArticles)
		pr.Post("/admin/articles", h.AdminCreateArticle)
		pr.Get("/admin/articles/{id}", h.AdminGetArticle)
		pr.Put("/admin/articles/{id}", h.AdminUpdateArticle)
		pr.Delete("/admin/articles/{id}", h.AdminDeleteArticle)
		pr.Post("/admin/articles/{id}/publish", h.AdminPublishArticle)
		pr.Post("/admin/articles/{id}/unpublish", h.AdminUnpublishArticle)
	})
}

// ---------------- Public Endpoints ----------------

type ArticleCardDTO struct {
	ID          string     `json:"id"`
	Slug        string     `json:"slug"`
	Title       string     `json:"title"`
	Excerpt     string     `json:"excerpt"`
	CoverURL    *string    `json:"coverUrl,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
}

func (h *Handler) ListPublicArticles(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)
	tagSlug := r.URL.Query().Get("tag")

	dbQuery := h.db.Model(&models.Article{}).Where("status = 'published'")

	if tagSlug != "" {
		dbQuery = dbQuery.Where("id IN (SELECT entity_id FROM content_tags ct JOIN tags t ON ct.tag_id = t.id WHERE t.slug = ? AND ct.entity_type = 'article')", tagSlug)
	}

	var total int64
	dbQuery.Count(&total)

	var articles []models.Article
	if err := dbQuery.Order("published_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&articles).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list articles"))
		return
	}

	cards := make([]ArticleCardDTO, 0, len(articles))
	for _, a := range articles {
		var coverURL *string
		if a.CoverMediaID != nil {
			url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *a.CoverMediaID)
			if mediaErr != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
				return
			}
			coverURL = &url
		}

		cards = append(cards, ArticleCardDTO{
			ID:          a.ID,
			Slug:        a.Slug,
			Title:       a.Title,
			Excerpt:     a.Excerpt,
			CoverURL:    coverURL,
			PublishedAt: a.PublishedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[ArticleCardDTO]{
		Data: cards,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) GetPublicArticleDetail(w http.ResponseWriter, r *http.Request) {
	articleSlug := chi.URLParam(r, "slug")

	var article models.Article
	if err := h.db.Where("slug = ? AND status = 'published'", articleSlug).First(&article).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Article not found or unpublished"))
		return
	}

	var coverURL *string
	if article.CoverMediaID != nil {
		url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *article.CoverMediaID)
		if mediaErr != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
			return
		}
		coverURL = &url
	}

	var tags []models.Tag
	h.db.Raw(`SELECT t.* FROM tags t JOIN content_tags ct ON ct.tag_id = t.id WHERE ct.entity_type = 'article' AND ct.entity_id = ?`, article.ID).Scan(&tags)

	type ArticleDetailDTO struct {
		ID              string       `json:"id"`
		Slug            string       `json:"slug"`
		Title           string       `json:"title"`
		Excerpt         string       `json:"excerpt"`
		BodyJSON        string       `json:"bodyJson"`
		CoverURL        *string      `json:"coverUrl,omitempty"`
		AuthorID        *string      `json:"authorId,omitempty"`
		SourceProductID *string      `json:"sourceProductId,omitempty"`
		Tags            []models.Tag `json:"tags"`
		PublishedAt     *time.Time   `json:"publishedAt,omitempty"`
	}

	resp := ArticleDetailDTO{
		ID:              article.ID,
		Slug:            article.Slug,
		Title:           article.Title,
		Excerpt:         article.Excerpt,
		BodyJSON:        article.BodyJSON,
		CoverURL:        coverURL,
		AuthorID:        article.AuthorID,
		SourceProductID: article.SourceProductID,
		Tags:            tags,
		PublishedAt:     article.PublishedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": resp})
}

func (h *Handler) GetPublicTag(w http.ResponseWriter, r *http.Request) {
	tagSlug := chi.URLParam(r, "slug")

	var tag models.Tag
	if err := h.db.Where("slug = ?", tagSlug).First(&tag).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Tag not found"))
		return
	}

	var articles []models.Article
	h.db.Raw(`SELECT a.* FROM articles a JOIN content_tags ct ON ct.entity_id = a.id WHERE ct.tag_id = ? AND a.status = 'published' ORDER BY a.published_at DESC LIMIT 12`, tag.ID).Scan(&articles)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"tag":      tag,
			"articles": articles,
		},
	})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) AdminListTags(w http.ResponseWriter, r *http.Request) {
	var tags []models.Tag
	h.db.Order("display_name asc").Find(&tags)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": tags})
}

func (h *Handler) AdminCreateTag(w http.ResponseWriter, r *http.Request) {
	var tag models.Tag
	_ = json.NewDecoder(r.Body).Decode(&tag)
	if tag.DisplayName == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "displayName is required"))
		return
	}

	tag.ID = id.New()
	if tag.Slug == "" {
		tag.Slug = slug.Make(tag.DisplayName)
	}
	if tag.TagKind == "" {
		tag.TagKind = "general"
	}

	if err := h.db.Create(&tag).Error; err != nil {
		errors.WriteJSON(w, r, errors.Conflict("TAG_EXISTS", "Tag slug and kind combination already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": tag})
}

func (h *Handler) AdminUpdateTag(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var tag models.Tag
	if err := h.db.Where("id = ?", id).First(&tag).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Tag not found"))
		return
	}
	_ = json.NewDecoder(r.Body).Decode(&tag)
	h.db.Save(&tag)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": tag})
}

func (h *Handler) AdminDeleteTag(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Where("tag_id = ?", id).Delete(&models.ContentTag{})
	h.db.Delete(&models.Tag{}, "id = ?", id)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminListArticles(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.Article{}).Count(&total)

	var articles []models.Article
	h.db.Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&articles)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.Article]{
		Data: articles,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

type AdminCreateArticleRequest struct {
	Title           string   `json:"title"`
	Slug            string   `json:"slug"`
	Excerpt         string   `json:"excerpt"`
	BodyJSON        string   `json:"bodyJson"`
	CategoryID      *string  `json:"categoryId"`
	CoverMediaID    *string  `json:"coverMediaId"`
	SourceProductID *string  `json:"sourceProductId"`
	TagIDs          []string `json:"tagIds"`
}

func (h *Handler) AdminCreateArticle(w http.ResponseWriter, r *http.Request) {
	var req AdminCreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if req.Title == "" || req.Excerpt == "" || req.BodyJSON == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "title, excerpt, and bodyJson are required"))
		return
	}

	artID := id.New()
	aSlug := req.Slug
	if aSlug == "" {
		aSlug = slug.Make(req.Title)
	}

	user := identity.GetUserFromContext(r.Context())
	var authorID *string
	if user != nil {
		authorID = &user.ID
	}

	article := models.Article{
		ID:              artID,
		Slug:            aSlug,
		Title:           req.Title,
		Excerpt:         req.Excerpt,
		BodyJSON:        req.BodyJSON,
		CategoryID:      req.CategoryID,
		Status:          "draft",
		CoverMediaID:    req.CoverMediaID,
		AuthorID:        authorID,
		SourceProductID: req.SourceProductID,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&article).Error; err != nil {
			return err
		}
		for _, tID := range req.TagIDs {
			tx.Create(&models.ContentTag{
				ID:         id.New(),
				EntityType: "article",
				EntityID:   artID,
				TagID:      tID,
			})
		}
		return nil
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Conflict("ARTICLE_EXISTS", "Article with this slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": article})
}

func (h *Handler) AdminGetArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var article models.Article
	if err := h.db.Where("id = ?", id).First(&article).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Article not found"))
		return
	}

	var tags []models.Tag
	h.db.Raw(`SELECT t.* FROM tags t JOIN content_tags ct ON ct.tag_id = t.id WHERE ct.entity_type = 'article' AND ct.entity_id = ?`, article.ID).Scan(&tags)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"article": article,
			"tags":    tags,
		},
	})
}

func (h *Handler) AdminUpdateArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var article models.Article
	if err := h.db.Where("id = ?", id).First(&article).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Article not found"))
		return
	}

	_ = json.NewDecoder(r.Body).Decode(&article)
	h.db.Save(&article)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": article})
}

func (h *Handler) AdminDeleteArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Where("entity_type = 'article' AND entity_id = ?", id).Delete(&models.ContentTag{})
	h.db.Delete(&models.Article{}, "id = ?", id)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminPublishArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	now := time.Now().UTC()

	if err := h.db.Model(&models.Article{}).Where("id = ?", id).Updates(map[string]any{
		"status":       "published",
		"published_at": &now,
	}).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to publish article"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"id":     id,
			"status": "published",
		},
	})
}

func (h *Handler) AdminUnpublishArticle(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.db.Model(&models.Article{}).Where("id = ?", id).Update("status", "draft").Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to unpublish article"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"id":     id,
			"status": "draft",
		},
	})
}

func (h *Handler) ListPublishedTags(w http.ResponseWriter, r *http.Request) {
	var tags []models.Tag
	if err := h.db.Model(&models.Tag{}).Distinct("tags.*").Joins("JOIN content_tags ct ON ct.tag_id = tags.id AND ct.entity_type = ?", "article").Joins("JOIN articles a ON a.id = ct.entity_id AND a.status = ?", "published").Order("tags.display_name asc").Find(&tags).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list published article tags"))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Data []models.Tag `json:"data"`
	}{tags}); err != nil {
		return
	}
}
