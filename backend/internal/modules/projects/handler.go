package projects

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
	r.Get("/public/project-types", h.GetPublicProjectTypes)
	r.Get("/public/provinces", h.GetPublicProvinces)
	r.Get("/public/projects", h.ListPublicProjects)
	r.Get("/public/projects/{slug}", h.GetPublicProjectDetail)

	// Admin routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))

		// Project types
		pr.Get("/admin/project-types", h.AdminListProjectTypes)
		pr.Post("/admin/project-types", h.AdminCreateProjectType)
		pr.Put("/admin/project-types/{id}", h.AdminUpdateProjectType)
		pr.Delete("/admin/project-types/{id}", h.AdminDeleteProjectType)

		// Provinces
		pr.Get("/admin/provinces", h.AdminListProvinces)
		pr.Post("/admin/provinces", h.AdminCreateProvince)

		// Projects
		pr.Get("/admin/projects", h.AdminListProjects)
		pr.Post("/admin/projects", h.AdminCreateProject)
		pr.Get("/admin/projects/{id}", h.AdminGetProject)
		pr.Put("/admin/projects/{id}", h.AdminUpdateProject)
		pr.Delete("/admin/projects/{id}", h.AdminDeleteProject)
		pr.Post("/admin/projects/{id}/publish", h.AdminPublishProject)
		pr.Post("/admin/projects/{id}/unpublish", h.AdminUnpublishProject)
	})
}

// ---------------- Public Endpoints ----------------

func (h *Handler) GetPublicProjectTypes(w http.ResponseWriter, r *http.Request) {
	var types []models.ProjectType
	h.db.Order("name asc").Find(&types)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": types})
}

func (h *Handler) GetPublicProvinces(w http.ResponseWriter, r *http.Request) {
	var provinces []models.Province
	h.db.Order("name asc").Find(&provinces)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": provinces})
}

type ProjectCardDTO struct {
	ID              string  `json:"id"`
	Slug            string  `json:"slug"`
	Title           string  `json:"title"`
	Summary         string  `json:"summary"`
	ProjectTypeSlug string  `json:"projectTypeSlug"`
	ProjectTypeName string  `json:"projectTypeName"`
	ProvinceCode    string  `json:"provinceCode"`
	ProvinceName    string  `json:"provinceName"`
	CoverURL        *string `json:"coverUrl,omitempty"`
}

func (h *Handler) ListPublicProjects(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)
	query := r.URL.Query()

	projectTypeSlug := query.Get("projectType")
	provinceCode := query.Get("province")

	dbQuery := h.db.Model(&models.Project{}).
		Preload("ProjectType").
		Preload("Province").
		Where("status = 'published'")

	if projectTypeSlug != "" {
		dbQuery = dbQuery.Where("project_type_id IN (SELECT id FROM project_types WHERE slug = ?)", projectTypeSlug)
	}

	if provinceCode != "" {
		dbQuery = dbQuery.Where("province_id IN (SELECT id FROM provinces WHERE code = ?)", provinceCode)
	}

	var total int64
	dbQuery.Count(&total)

	var projects []models.Project
	if err := dbQuery.Order("published_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&projects).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to fetch projects"))
		return
	}

	cards := make([]ProjectCardDTO, 0, len(projects))
	for _, proj := range projects {
		ptSlug, ptName := "", ""
		if proj.ProjectType != nil {
			ptSlug = proj.ProjectType.Slug
			ptName = proj.ProjectType.Name
		}
		pvCode, pvName := "", ""
		if proj.Province != nil {
			pvCode = proj.Province.Code
			pvName = proj.Province.Name
		}
		var coverURL *string
		if proj.CoverMediaID != nil {
			url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *proj.CoverMediaID)
			if mediaErr != nil {
				errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
				return
			}
			coverURL = &url
		}

		cards = append(cards, ProjectCardDTO{
			ID:              proj.ID,
			Slug:            proj.Slug,
			Title:           proj.Title,
			Summary:         proj.Summary,
			ProjectTypeSlug: ptSlug,
			ProjectTypeName: ptName,
			ProvinceCode:    pvCode,
			ProvinceName:    pvName,
			CoverURL:        coverURL,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[ProjectCardDTO]{
		Data: cards,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) GetPublicProjectDetail(w http.ResponseWriter, r *http.Request) {
	projectSlug := chi.URLParam(r, "slug")

	var proj models.Project
	if err := h.db.
		Preload("ProjectType").
		Preload("Province").
		Preload("Products.Product").
		Where("slug = ? AND status = 'published'", projectSlug).
		First(&proj).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Project not found or unpublished"))
		return
	}

	var coverURL *string
	if proj.CoverMediaID != nil {
		url, mediaErr := media.ResolvePublicURL(h.db, h.cfg, *proj.CoverMediaID)
		if mediaErr != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve media"))
			return
		}
		coverURL = &url
	}

	type ProductRefDTO struct {
		ID   string `json:"id"`
		SKU  string `json:"sku"`
		Slug string `json:"slug"`
		Name string `json:"name"`
	}

	products := make([]ProductRefDTO, 0, len(proj.Products))
	for _, pp := range proj.Products {
		if pp.Product != nil {
			products = append(products, ProductRefDTO{
				ID:   pp.Product.ID,
				SKU:  pp.Product.SKU,
				Slug: pp.Product.Slug,
				Name: pp.Product.Name,
			})
		}
	}

	type ProjectDetailDTO struct {
		ID          string          `json:"id"`
		Slug        string          `json:"slug"`
		Title       string          `json:"title"`
		Summary     string          `json:"summary"`
		BodyJSON    *string         `json:"bodyJson,omitempty"`
		CoverURL    *string         `json:"coverUrl,omitempty"`
		ProjectType any             `json:"projectType,omitempty"`
		Province    any             `json:"province,omitempty"`
		Products    []ProductRefDTO `json:"products"`
		CompletedAt *time.Time      `json:"completedAt,omitempty"`
		PublishedAt *time.Time      `json:"publishedAt,omitempty"`
	}

	resp := ProjectDetailDTO{
		ID:          proj.ID,
		Slug:        proj.Slug,
		Title:       proj.Title,
		Summary:     proj.Summary,
		BodyJSON:    proj.BodyJSON,
		CoverURL:    coverURL,
		ProjectType: proj.ProjectType,
		Province:    proj.Province,
		Products:    products,
		CompletedAt: proj.CompletedAt,
		PublishedAt: proj.PublishedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": resp})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) AdminListProjectTypes(w http.ResponseWriter, r *http.Request) {
	var list []models.ProjectType
	h.db.Find(&list)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": list})
}

func (h *Handler) AdminCreateProjectType(w http.ResponseWriter, r *http.Request) {
	var pt models.ProjectType
	_ = json.NewDecoder(r.Body).Decode(&pt)
	pt.ID = id.New()
	if pt.Slug == "" {
		pt.Slug = slug.Make(pt.Name)
	}
	h.db.Create(&pt)
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": pt})
}

func (h *Handler) AdminUpdateProjectType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var pt models.ProjectType
	if err := h.db.Where("id = ?", id).First(&pt).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Project type not found"))
		return
	}
	_ = json.NewDecoder(r.Body).Decode(&pt)
	h.db.Save(&pt)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": pt})
}

func (h *Handler) AdminDeleteProjectType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Delete(&models.ProjectType{}, "id = ?", id)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminListProvinces(w http.ResponseWriter, r *http.Request) {
	var list []models.Province
	h.db.Find(&list)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": list})
}

func (h *Handler) AdminCreateProvince(w http.ResponseWriter, r *http.Request) {
	var pv models.Province
	_ = json.NewDecoder(r.Body).Decode(&pv)
	pv.ID = id.New()
	h.db.Create(&pv)
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": pv})
}

func (h *Handler) AdminListProjects(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.Project{}).Count(&total)

	var projects []models.Project
	h.db.Preload("ProjectType").Preload("Province").
		Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&projects)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.Project]{
		Data: projects,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

type AdminCreateProjectRequest struct {
	Title         string   `json:"title"`
	Slug          string   `json:"slug"`
	ProjectTypeID string   `json:"projectTypeId"`
	ProvinceID    string   `json:"provinceId"`
	BranchID      *string  `json:"branchId"`
	Summary       string   `json:"summary"`
	BodyJSON      *string  `json:"bodyJson"`
	CoverMediaID  *string  `json:"coverMediaId"`
	ProductIDs    []string `json:"productIds"`
}

func (h *Handler) AdminCreateProject(w http.ResponseWriter, r *http.Request) {
	var req AdminCreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if req.Title == "" || req.ProjectTypeID == "" || req.ProvinceID == "" || req.Summary == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "title, projectTypeId, provinceId, and summary are required"))
		return
	}

	projID := id.New()
	pSlug := req.Slug
	if pSlug == "" {
		pSlug = slug.Make(req.Title)
	}

	proj := models.Project{
		ID:            projID,
		Slug:          pSlug,
		Title:         req.Title,
		ProjectTypeID: req.ProjectTypeID,
		ProvinceID:    req.ProvinceID,
		BranchID:      req.BranchID,
		Summary:       req.Summary,
		BodyJSON:      req.BodyJSON,
		CoverMediaID:  req.CoverMediaID,
		Status:        "draft",
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&proj).Error; err != nil {
			return err
		}
		for _, pID := range req.ProductIDs {
			tx.Create(&models.ProjectProduct{ProjectID: projID, ProductID: pID})
		}
		return nil
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Conflict("PROJECT_EXISTS", "Project with this slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": proj})
}

func (h *Handler) AdminGetProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var proj models.Project
	if err := h.db.Preload("ProjectType").Preload("Province").Preload("Products.Product").
		Where("id = ?", id).First(&proj).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Project not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": proj})
}

func (h *Handler) AdminUpdateProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var proj models.Project
	if err := h.db.Where("id = ?", id).First(&proj).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Project not found"))
		return
	}

	_ = json.NewDecoder(r.Body).Decode(&proj)
	h.db.Save(&proj)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": proj})
}

func (h *Handler) AdminDeleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Where("project_id = ?", id).Delete(&models.ProjectProduct{})
	h.db.Delete(&models.Project{}, "id = ?", id)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]bool{"success": true}})
}

func (h *Handler) AdminPublishProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	now := time.Now().UTC()

	if err := h.db.Model(&models.Project{}).Where("id = ?", id).Updates(map[string]any{
		"status":       "published",
		"published_at": &now,
	}).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to publish project"))
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

func (h *Handler) AdminUnpublishProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.db.Model(&models.Project{}).Where("id = ?", id).Update("status", "draft").Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to unpublish project"))
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
