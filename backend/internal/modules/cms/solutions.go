package cms

import (
	"encoding/json"
	"net/http"
	"strings"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/richcontent"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"
	"bmsolar-backend/internal/modules/media"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// SolutionDetailDTO matches frontend DetailedSolution interface
type SolutionDetailDTO struct {
	DocumentJSON            string                 `json:"documentJson,omitempty"`
	HasEnglish              bool                   `json:"hasEnglish"`
	English                 *models.EnglishContent `json:"english,omitempty"`
	ID                      string                 `json:"id"`
	Slug                    string                 `json:"slug"`
	Title                   string                 `json:"title"`
	Subtitle                string                 `json:"subtitle"`
	AudienceCode            string                 `json:"audienceCode"`
	CapacityRange           string                 `json:"capacityRange"`
	HeroImage               string                 `json:"heroImage"`
	MonthlySavings          string                 `json:"monthlySavings"`
	RoiYears                string                 `json:"roiYears"`
	WarrantyPeriod          string                 `json:"warrantyPeriod"`
	Overview                string                 `json:"overview"`
	Benefits                any                    `json:"benefits"`
	EquipmentList           any                    `json:"equipmentList"`
	ProcessSteps            any                    `json:"processSteps"`
	RecommendedProductSlugs []string               `json:"recommendedProductSlugs"`
	RelatedProjectSlugs     []string               `json:"relatedProjectSlugs"`
	Status                  string                 `json:"status"`
	SortOrder               int                    `json:"sortOrder"`
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
		HasEnglish:              s.English.Available(),
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

func localizedSolution(s models.Solution, locale string) SolutionDetailDTO {
	dto := solutionToDTO(s)
	if locale != "en-US" || !dto.HasEnglish {
		return dto
	}
	english := s.English
	dto.Title = models.LocalizedText(dto.Title, english.Title)
	dto.Subtitle = models.LocalizedText(dto.Subtitle, english.Subtitle)
	dto.CapacityRange = models.LocalizedText(dto.CapacityRange, english.Capacity)
	dto.MonthlySavings = models.LocalizedText(dto.MonthlySavings, english.Savings)
	dto.RoiYears = models.LocalizedText(dto.RoiYears, english.ROI)
	dto.WarrantyPeriod = models.LocalizedText(dto.WarrantyPeriod, english.Warranty)
	dto.Overview = models.LocalizedText(dto.Overview, english.Body)
	if rows := englishRows(english.BenefitsText, 2); len(rows) > 0 {
		result := make([]englishBenefit, 0, len(rows))
		for _, row := range rows {
			result = append(result, englishBenefit{row[0], row[1]})
		}
		dto.Benefits = result
	}
	if rows := englishRows(english.EquipmentText, 3); len(rows) > 0 {
		result := make([]englishEquipment, 0, len(rows))
		for _, row := range rows {
			result = append(result, englishEquipment{row[0], row[1], row[2]})
		}
		dto.EquipmentList = result
	}
	if rows := englishRows(english.ProcessText, 2); len(rows) > 0 {
		result := make([]englishStep, 0, len(rows))
		for index, row := range rows {
			result = append(result, englishStep{index + 1, row[0], row[1]})
		}
		dto.ProcessSteps = result
	}
	return dto
}

func adminSolution(s models.Solution) SolutionDetailDTO {
	dto := solutionToDTO(s)
	dto.English = s.English
	return dto
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
		dto := localizedSolution(s, r.URL.Query().Get("locale"))
		dto.Overview, _ = richcontent.PlainText(dto.Overview)
		dtos = append(dtos, dto)
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

	dto := localizedSolution(solution, r.URL.Query().Get("locale"))
	overview, err := media.ResolveRichContent(h.db, h.cfg, dto.Overview)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to resolve document"))
		return
	}
	plainOverview, hasDocument := richcontent.PlainText(overview)
	if hasDocument {
		dto.DocumentJSON = overview
	}
	dto.Overview = plainOverview
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dto,
	})
}

// GetPublicContactChannels returns active global contact channels for floating dock & social bar
func (h *Handler) GetPublicContactChannels(w http.ResponseWriter, r *http.Request) {
	var channels []models.ContactChannel
	if err := h.db.Where("(branch_id IS NULL OR branch_id = '') AND enabled = true").Order("sort_order asc").Find(&channels).Error; err != nil {
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
			ID:          c.ID,
			BranchID:    c.BranchID,
			Type:        c.Type,
			Label:       c.Label,
			Target:      target,
			Formatted:   target,
			SortOrder:   c.SortOrder,
			Enabled:     c.Enabled,
			IsActive:    c.Enabled,
			Icon:        c.Icon,
			AccentColor: c.AccentColor,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
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
		dtos = append(dtos, adminSolution(s))
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

	dto := adminSolution(solution)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": dto,
	})
}

// CreateSolution creates a new solution
func (h *Handler) CreateSolution(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		English                 *models.EnglishContent `json:"english"`
		Slug                    string                 `json:"slug"`
		Title                   string                 `json:"title"`
		Subtitle                string                 `json:"subtitle"`
		AudienceCode            string                 `json:"audienceCode"`
		CapacityRange           string                 `json:"capacityRange"`
		HeroImage               string                 `json:"heroImage"`
		MonthlySavings          string                 `json:"monthlySavings"`
		RoiYears                string                 `json:"roiYears"`
		WarrantyPeriod          string                 `json:"warrantyPeriod"`
		Overview                string                 `json:"overview"`
		BenefitsJSON            string                 `json:"benefitsJson"`
		EquipmentJSON           string                 `json:"equipmentJson"`
		ProcessJSON             string                 `json:"processJson"`
		RecommendedProductSlugs string                 `json:"recommendedProductSlugs"`
		RelatedProjectSlugs     string                 `json:"relatedProjectSlugs"`
		Status                  string                 `json:"status"`
		SortOrder               int                    `json:"sortOrder"`
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
		English:                 payload.English,
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

	if err := richcontent.Validate(sol.Overview, sol.English.ContentBody()); err != nil {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_DOCUMENT", err.Error()))
		return
	}
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&sol).Error; err != nil {
			return err
		}
		return identity.AuditContentWrite(tx, r.Context(), "create", "solution", sol.ID)
	}); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("DUPLICATE_SLUG", "Slug may already exist"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": adminSolution(sol),
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
		English                 *models.EnglishContent `json:"english"`
		Slug                    *string                `json:"slug"`
		Title                   *string                `json:"title"`
		Subtitle                *string                `json:"subtitle"`
		AudienceCode            *string                `json:"audienceCode"`
		CapacityRange           *string                `json:"capacityRange"`
		HeroImage               *string                `json:"heroImage"`
		MonthlySavings          *string                `json:"monthlySavings"`
		RoiYears                *string                `json:"roiYears"`
		WarrantyPeriod          *string                `json:"warrantyPeriod"`
		Overview                *string                `json:"overview"`
		BenefitsJSON            *string                `json:"benefitsJson"`
		EquipmentJSON           *string                `json:"equipmentJson"`
		ProcessJSON             *string                `json:"processJson"`
		RecommendedProductSlugs *string                `json:"recommendedProductSlugs"`
		RelatedProjectSlugs     *string                `json:"relatedProjectSlugs"`
		Status                  *string                `json:"status"`
		SortOrder               *int                   `json:"sortOrder"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if payload.English != nil {
		existing.English = payload.English
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

	if err := richcontent.Validate(existing.Overview, existing.English.ContentBody()); err != nil {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_DOCUMENT", err.Error()))
		return
	}
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&existing).Error; err != nil {
			return err
		}
		return identity.AuditContentWrite(tx, r.Context(), "update", "solution", existing.ID)
	}); err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to update solution"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": adminSolution(existing),
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

func englishRows(value string, cells int) [][]string {
	var output [][]string
	for _, line := range strings.Split(value, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		row := strings.SplitN(line, "|", cells)
		for len(row) < cells {
			row = append(row, "")
		}
		for i := range row {
			row[i] = strings.TrimSpace(row[i])
		}
		if row[0] != "" {
			output = append(output, row)
		}
	}
	return output
}

type englishBenefit struct {
	Title       string `json:"title"`
	Description string `json:"desc"`
}
type englishEquipment struct {
	Name     string `json:"name"`
	Brand    string `json:"brand"`
	Warranty string `json:"warranty"`
}
type englishStep struct {
	Step        int    `json:"step"`
	Title       string `json:"title"`
	Description string `json:"desc"`
}
