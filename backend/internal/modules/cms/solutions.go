package cms

import (
	"encoding/json"
	"net/http"
	"strings"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/database/models"

	"github.com/go-chi/chi/v5"
)

// SolutionDetailDTO matches frontend DetailedSolution interface
type SolutionDetailDTO struct {
	ID                      string   `json:"id"`
	Slug                    string   `json:"slug"`
	Title                   string   `json:"title"`
	Subtitle                string   `json:"subtitle"`
	AudienceCode            string   `json:"audienceCode"`
	CapacityRange           string   `json:"capacityRange"`
	HeroImage               string   `json:"heroImage"`
	MonthlySavings          string   `json:"monthlySavings"`
	RoiYears                string   `json:"roiYears"`
	WarrantyPeriod          string   `json:"warrantyPeriod"`
	Overview                string   `json:"overview"`
	Benefits                any      `json:"benefits"`
	EquipmentList           any      `json:"equipmentList"`
	ProcessSteps            any      `json:"processSteps"`
	RecommendedProductSlugs []string `json:"recommendedProductSlugs"`
	RelatedProjectSlugs     []string `json:"relatedProjectSlugs"`
	Status                  string   `json:"status"`
	SortOrder               int      `json:"sortOrder"`
}

func solutionToDTO(s models.Solution) SolutionDetailDTO {
	var benefits any = []any{}
	if s.BenefitsJSON != "" {
		_ = json.Unmarshal([]byte(s.BenefitsJSON), &benefits)
	}

	var equipment any = []any{}
	if s.EquipmentJSON != "" {
		_ = json.Unmarshal([]byte(s.EquipmentJSON), &equipment)
	}

	var process any = []any{}
	if s.ProcessJSON != "" {
		_ = json.Unmarshal([]byte(s.ProcessJSON), &process)
	}

	var recProducts []string = []string{}
	if s.RecommendedProductSlugs != "" {
		_ = json.Unmarshal([]byte(s.RecommendedProductSlugs), &recProducts)
	}

	var relProjects []string = []string{}
	if s.RelatedProjectSlugs != "" {
		_ = json.Unmarshal([]byte(s.RelatedProjectSlugs), &relProjects)
	}

	return SolutionDetailDTO{
		ID:                      s.ID,
		Slug:                    s.Slug,
		Title:                   s.Title,
		Subtitle:                s.Subtitle,
		AudienceCode:            s.AudienceCode,
		CapacityRange:           s.CapacityRange,
		HeroImage:               s.HeroImage,
		MonthlySavings:          s.MonthlySavings,
		RoiYears:                s.RoiYears,
		WarrantyPeriod:          s.WarrantyPeriod,
		Overview:                s.Overview,
		Benefits:                benefits,
		EquipmentList:           equipment,
		ProcessSteps:            process,
		RecommendedProductSlugs: recProducts,
		RelatedProjectSlugs:     relProjects,
		Status:                  s.Status,
		SortOrder:               s.SortOrder,
	}
}

// ---------------- Public Solution Endpoints ----------------

// ListPublicSolutions returns published solutions ordered by sort_order
func (h *Handler) ListPublicSolutions(w http.ResponseWriter, r *http.Request) {
	var solutions []models.Solution
	if err := h.db.Where("status = ?", "published").Order("sort_order asc").Find(&solutions).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list solutions"))
		return
	}

	dtos := make([]SolutionDetailDTO, 0, len(solutions))
	for _, s := range solutions {
		dtos = append(dtos, solutionToDTO(s))
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dtos,
	})
}

// GetPublicSolutionBySlug retrieves a solution by slug, supporting alias mapping
func (h *Handler) GetPublicSolutionBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	normalizedSlug := strings.ToLower(strings.TrimSpace(slug))

	// Map aliases
	querySlugs := []string{normalizedSlug}
	switch normalizedSlug {
	case "household", "ho-gia-dinh":
		querySlugs = []string{"ho-gia-dinh", "household"}
	case "business", "doanh-nghiep":
		querySlugs = []string{"doanh-nghiep", "business"}
	case "industrial", "nha-xuong", "nha-xuong-cong-nghiep":
		querySlugs = []string{"nha-xuong-cong-nghiep", "industrial", "nha-xuong"}
	}

	var solution models.Solution
	err := h.db.Where("slug IN ? AND status = ?", querySlugs, "published").First(&solution).Error
	if err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Solution not found"))
		return
	}

	dto := solutionToDTO(solution)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dto,
	})
}

// GetPublicContactChannels returns active global contact channels for floating dock & social bar
func (h *Handler) GetPublicContactChannels(w http.ResponseWriter, r *http.Request) {
	var channels []models.ContactChannel
	if err := h.db.Where("branch_id IS NULL AND enabled = true").Order("sort_order asc").Find(&channels).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to fetch contact channels"))
		return
	}

	dtos := make([]ChannelDTO, 0, len(channels))
	for _, c := range channels {
		target := c.Target
		if c.Type == "phone" {
			target = NormalizePhone(target)
		} else if c.Type == "zalo" {
			target = ValidateZaloTarget(target)
		}
		dtos = append(dtos, ChannelDTO{
			ID:        c.ID,
			Type:      c.Type,
			Label:     c.Label,
			Target:    target,
			Formatted: target,
			SortOrder: c.SortOrder,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=30")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dtos,
	})
}

// ---------------- Admin Solution Endpoints ----------------

// ListAdminSolutions returns all solutions for admin management
func (h *Handler) ListAdminSolutions(w http.ResponseWriter, r *http.Request) {
	var solutions []models.Solution
	if err := h.db.Order("sort_order asc, created_at desc").Find(&solutions).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list solutions"))
		return
	}

	dtos := make([]SolutionDetailDTO, 0, len(solutions))
	for _, s := range solutions {
		dtos = append(dtos, solutionToDTO(s))
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dtos,
	})
}

// GetAdminSolution gets a solution by ID
func (h *Handler) GetAdminSolution(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var solution models.Solution
	if err := h.db.Where("id = ?", id).First(&solution).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Solution not found"))
		return
	}

	dto := solutionToDTO(solution)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dto,
	})
}

// CreateSolution creates a new solution
func (h *Handler) CreateSolution(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Slug                    string `json:"slug"`
		Title                   string `json:"title"`
		Subtitle                string `json:"subtitle"`
		AudienceCode            string `json:"audienceCode"`
		CapacityRange           string `json:"capacityRange"`
		HeroImage               string `json:"heroImage"`
		MonthlySavings          string `json:"monthlySavings"`
		RoiYears                string `json:"roiYears"`
		WarrantyPeriod          string `json:"warrantyPeriod"`
		Overview                string `json:"overview"`
		BenefitsJSON            string `json:"benefitsJson"`
		EquipmentJSON           string `json:"equipmentJson"`
		ProcessJSON             string `json:"processJson"`
		RecommendedProductSlugs string `json:"recommendedProductSlugs"`
		RelatedProjectSlugs     string `json:"relatedProjectSlugs"`
		Status                  string `json:"status"`
		SortOrder               int    `json:"sortOrder"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if payload.Slug == "" || payload.Title == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Slug and Title are required"))
		return
	}

	status := payload.Status
	if status == "" {
		status = "published"
	}

	sol := models.Solution{
		ID:                      id.New(),
		Slug:                    strings.ToLower(strings.TrimSpace(payload.Slug)),
		Title:                   payload.Title,
		Subtitle:                payload.Subtitle,
		AudienceCode:            payload.AudienceCode,
		CapacityRange:           payload.CapacityRange,
		HeroImage:               payload.HeroImage,
		MonthlySavings:          payload.MonthlySavings,
		RoiYears:                payload.RoiYears,
		WarrantyPeriod:          payload.WarrantyPeriod,
		Overview:                payload.Overview,
		BenefitsJSON:            payload.BenefitsJSON,
		EquipmentJSON:           payload.EquipmentJSON,
		ProcessJSON:             payload.ProcessJSON,
		RecommendedProductSlugs: payload.RecommendedProductSlugs,
		RelatedProjectSlugs:     payload.RelatedProjectSlugs,
		Status:                  status,
		SortOrder:               payload.SortOrder,
	}

	if err := h.db.Create(&sol).Error; err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("DUPLICATE_SLUG", "Slug may already exist"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": solutionToDTO(sol),
	})
}

// UpdateSolution updates an existing solution
func (h *Handler) UpdateSolution(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var existing models.Solution
	if err := h.db.Where("id = ?", id).First(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Solution not found"))
		return
	}

	var payload struct {
		Slug                    *string `json:"slug"`
		Title                   *string `json:"title"`
		Subtitle                *string `json:"subtitle"`
		AudienceCode            *string `json:"audienceCode"`
		CapacityRange           *string `json:"capacityRange"`
		HeroImage               *string `json:"heroImage"`
		MonthlySavings          *string `json:"monthlySavings"`
		RoiYears                *string `json:"roiYears"`
		WarrantyPeriod          *string `json:"warrantyPeriod"`
		Overview                *string `json:"overview"`
		BenefitsJSON            *string `json:"benefitsJson"`
		EquipmentJSON           *string `json:"equipmentJson"`
		ProcessJSON             *string `json:"processJson"`
		RecommendedProductSlugs *string `json:"recommendedProductSlugs"`
		RelatedProjectSlugs     *string `json:"relatedProjectSlugs"`
		Status                  *string `json:"status"`
		SortOrder               *int    `json:"sortOrder"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if payload.Slug != nil {
		existing.Slug = strings.ToLower(strings.TrimSpace(*payload.Slug))
	}
	if payload.Title != nil {
		existing.Title = *payload.Title
	}
	if payload.Subtitle != nil {
		existing.Subtitle = *payload.Subtitle
	}
	if payload.AudienceCode != nil {
		existing.AudienceCode = *payload.AudienceCode
	}
	if payload.CapacityRange != nil {
		existing.CapacityRange = *payload.CapacityRange
	}
	if payload.HeroImage != nil {
		existing.HeroImage = *payload.HeroImage
	}
	if payload.MonthlySavings != nil {
		existing.MonthlySavings = *payload.MonthlySavings
	}
	if payload.RoiYears != nil {
		existing.RoiYears = *payload.RoiYears
	}
	if payload.WarrantyPeriod != nil {
		existing.WarrantyPeriod = *payload.WarrantyPeriod
	}
	if payload.Overview != nil {
		existing.Overview = *payload.Overview
	}
	if payload.BenefitsJSON != nil {
		existing.BenefitsJSON = *payload.BenefitsJSON
	}
	if payload.EquipmentJSON != nil {
		existing.EquipmentJSON = *payload.EquipmentJSON
	}
	if payload.ProcessJSON != nil {
		existing.ProcessJSON = *payload.ProcessJSON
	}
	if payload.RecommendedProductSlugs != nil {
		existing.RecommendedProductSlugs = *payload.RecommendedProductSlugs
	}
	if payload.RelatedProjectSlugs != nil {
		existing.RelatedProjectSlugs = *payload.RelatedProjectSlugs
	}
	if payload.Status != nil {
		existing.Status = *payload.Status
	}
	if payload.SortOrder != nil {
		existing.SortOrder = *payload.SortOrder
	}

	if err := h.db.Save(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to update solution"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": solutionToDTO(existing),
	})
}

// DeleteSolution deletes a solution by ID
func (h *Handler) DeleteSolution(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.db.Delete(&models.Solution{}, "id = ?", id).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to delete solution"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}
