package leads

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"
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
	// Public endpoint
	r.Post("/public/leads", h.SubmitLead)

	// Admin routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))
		pr.Use(identity.RequirePermission("crm.lead.read"))

		pr.Get("/admin/leads", h.ListLeads)
		pr.Get("/admin/leads/{id}", h.GetLead)
		pr.Get("/admin/leads/{id}/activities", h.GetLeadActivities)

		pr.Group(func(ar chi.Router) {
			ar.Use(identity.RequirePermission("crm.lead.assign"))
			ar.Post("/admin/leads/{id}/assign", h.AssignLead)
		})

		pr.Group(func(tr chi.Router) {
			tr.Use(identity.RequirePermission("crm.lead.transition"))
			tr.Post("/admin/leads/{id}/transition", h.TransitionLead)
			ar := tr
			ar.Post("/admin/leads/{id}/notes", h.AddLeadNote)
		})
	})
}

// ---------------- Public Endpoint ----------------

type CreateLeadRequest struct {
	Name                 string  `json:"name"`
	Phone                *string `json:"phone"`
	Email                *string `json:"email"`
	Message              string  `json:"message"`
	BranchID             *string `json:"branchId"`
	Audience             *string `json:"audience"`
	ProductID            *string `json:"productId"`
	ProjectID            *string `json:"projectId"`
	PrivacyConsent       bool    `json:"privacyConsent"`
	PrivacyPolicyVersion string  `json:"privacyPolicyVersion"`
	SourcePage           string  `json:"sourcePage"`
	UtmJSON              *string `json:"utmJson"`
}

type CreateLeadResponse struct {
	ReferenceCode string    `json:"referenceCode"`
	ReceivedAt    time.Time `json:"receivedAt"`
}

func (h *Handler) SubmitLead(w http.ResponseWriter, r *http.Request) {
	idempotencyKey := r.Header.Get("Idempotency-Key")

	// Check if already submitted with this Idempotency-Key
	if idempotencyKey != "" {
		var existing models.Lead
		if err := h.db.Where("idempotency_key = ?", idempotencyKey).First(&existing).Error; err == nil {
			// Idempotent replay: return identical reference
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]any{
				"data": CreateLeadResponse{
					ReferenceCode: existing.RefCode,
					ReceivedAt:    existing.CreatedAt,
				},
			})
			return
		}
	}

	var req CreateLeadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed request body"))
		return
	}

	// Validation
	if strings.TrimSpace(req.Name) == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Field 'name' is required"))
		return
	}
	if (req.Phone == nil || strings.TrimSpace(*req.Phone) == "") && (req.Email == nil || strings.TrimSpace(*req.Email) == "") {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Either 'phone' or 'email' must be provided"))
		return
	}
	if strings.TrimSpace(req.Message) == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Field 'message' is required"))
		return
	}
	if !req.PrivacyConsent {
		errors.WriteJSON(w, r, errors.BadRequest("CONSENT_REQUIRED", "Privacy consent is mandatory to submit inquiry"))
		return
	}
	if req.PrivacyPolicyVersion == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Field 'privacyPolicyVersion' is required"))
		return
	}
	if req.SourcePage == "" {
		req.SourcePage = "/"
	}

	// Phone normalization
	var normalizedPhone *string
	if req.Phone != nil && strings.TrimSpace(*req.Phone) != "" {
		p := cms.NormalizePhone(*req.Phone)
		normalizedPhone = &p
	}

	// Reference code generation
	randomBytes := make([]byte, 3)
	_, _ = rand.Read(randomBytes)
	refCode := fmt.Sprintf("BM-%s-%s", time.Now().Format("060102"), strings.ToUpper(hex.EncodeToString(randomBytes)))

	now := time.Now().UTC()
	leadID := id.New()

	var idemKeyPtr *string
	if idempotencyKey != "" {
		idemKeyPtr = &idempotencyKey
	}

	lead := models.Lead{
		ID:                   leadID,
		RefCode:              refCode,
		Name:                 req.Name,
		Phone:                normalizedPhone,
		Email:                req.Email,
		BranchID:             req.BranchID,
		ProductID:            req.ProductID,
		ProjectID:            req.ProjectID,
		Message:              req.Message,
		SourcePage:           req.SourcePage,
		UtmJSON:              req.UtmJSON,
		ConsentAt:            now,
		PrivacyPolicyVersion: req.PrivacyPolicyVersion,
		Status:               "new",
		IdempotencyKey:       idemKeyPtr,
	}

	activity := models.LeadActivity{
		ID:        id.New(),
		LeadID:    leadID,
		Kind:      "created",
		Note:      strPtr(fmt.Sprintf("Lead submitted via form on %s", req.SourcePage)),
		CreatedAt: now,
	}

	outboxPayload, _ := json.Marshal(map[string]any{
		"leadId":    leadID,
		"refCode":   refCode,
		"name":      req.Name,
		"branchId":  req.BranchID,
		"createdAt": now,
	})

	outbox := models.OutboxEvent{
		ID:            id.New(),
		EventType:     "LeadCreated",
		AggregateType: "Lead",
		AggregateID:   leadID,
		PayloadJSON:   string(outboxPayload),
		Status:        "pending",
		OccurredAt:    now,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&lead).Error; err != nil {
			return err
		}
		if err := tx.Create(&activity).Error; err != nil {
			return err
		}
		return tx.Create(&outbox).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to record consultation inquiry"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": CreateLeadResponse{
			ReferenceCode: refCode,
			ReceivedAt:    now,
		},
	})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) ListLeads(w http.ResponseWriter, r *http.Request) {
	user := identity.GetUserFromContext(r.Context())
	p := pagination.FromRequest(r)
	query := r.URL.Query()

	status := query.Get("status")
	branchID := query.Get("branchId")

	dbQuery := h.db.Model(&models.Lead{}).Preload("Branch")

	// Branch tenant scoping: If user is not super_admin or admin and has branchId, restrict to their branch
	isGlobalAdmin := false
	for _, role := range user.Roles {
		if role == "super_admin" || role == "admin" {
			isGlobalAdmin = true
			break
		}
	}

	if !isGlobalAdmin && user.BranchID != nil {
		dbQuery = dbQuery.Where("branch_id = ?", *user.BranchID)
	} else if branchID != "" {
		dbQuery = dbQuery.Where("branch_id = ?", branchID)
	}

	if status != "" {
		dbQuery = dbQuery.Where("status = ?", status)
	}

	var total int64
	dbQuery.Count(&total)

	var leads []models.Lead
	if err := dbQuery.Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&leads).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list leads"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.Lead]{
		Data: leads,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) GetLead(w http.ResponseWriter, r *http.Request) {
	leadID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var lead models.Lead
	if err := h.db.Preload("Branch").Preload("Activities").Where("id = ?", leadID).First(&lead).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Lead not found"))
		return
	}

	// Branch isolation check
	if !h.canAccessLead(user, &lead) {
		errors.WriteJSON(w, r, errors.Forbidden("Access to lead from another branch is forbidden"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": lead})
}

func (h *Handler) GetLeadActivities(w http.ResponseWriter, r *http.Request) {
	leadID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var lead models.Lead
	if err := h.db.Where("id = ?", leadID).First(&lead).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Lead not found"))
		return
	}

	if !h.canAccessLead(user, &lead) {
		errors.WriteJSON(w, r, errors.Forbidden("Access forbidden"))
		return
	}

	var activities []models.LeadActivity
	h.db.Where("lead_id = ?", leadID).Order("created_at asc").Find(&activities)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": activities})
}

func (h *Handler) AssignLead(w http.ResponseWriter, r *http.Request) {
	leadID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var input struct {
		AssigneeID string  `json:"assigneeId"`
		BranchID   *string `json:"branchId"`
		Note       *string `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed request body"))
		return
	}

	var lead models.Lead
	if err := h.db.Where("id = ?", leadID).First(&lead).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Lead not found"))
		return
	}

	if !h.canAccessLead(user, &lead) {
		errors.WriteJSON(w, r, errors.Forbidden("Access forbidden"))
		return
	}

	now := time.Now().UTC()
	updates := map[string]any{
		"assignee_id": input.AssigneeID,
		"assigned_at": &now,
	}
	if input.BranchID != nil {
		updates["branch_id"] = *input.BranchID
	}
	if lead.Status == "new" {
		updates["status"] = "assigned"
	}

	act := models.LeadActivity{
		ID:        id.New(),
		LeadID:    leadID,
		ActorID:   &user.ID,
		Kind:      "assigned",
		Note:      input.Note,
		CreatedAt: now,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&lead).Updates(updates).Error; err != nil {
			return err
		}
		return tx.Create(&act).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to assign lead"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"leadId":     leadID,
			"assigneeId": input.AssigneeID,
			"assignedAt": now,
		},
	})
}

func (h *Handler) TransitionLead(w http.ResponseWriter, r *http.Request) {
	leadID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var input struct {
		ToStatus string  `json:"toStatus"`
		Reason   *string `json:"reason"`
		Note     *string `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	var lead models.Lead
	if err := h.db.Where("id = ?", leadID).First(&lead).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Lead not found"))
		return
	}

	if !h.canAccessLead(user, &lead) {
		errors.WriteJSON(w, r, errors.Forbidden("Access forbidden"))
		return
	}

	// State machine validation
	// new -> assigned -> contacted -> qualified -> quoted -> won / lost / invalid
	validTransitions := map[string][]string{
		"new":       {"assigned", "contacted", "invalid"},
		"assigned":  {"contacted", "invalid"},
		"contacted": {"qualified", "lost", "invalid"},
		"qualified": {"quoted", "lost", "invalid"},
		"quoted":    {"won", "lost", "invalid"},
		"won":       {},
		"lost":      {"contacted"}, // reactivation allowed
		"invalid":   {},
	}

	allowed, ok := validTransitions[lead.Status]
	isAllowed := false
	if ok {
		for _, s := range allowed {
			if s == input.ToStatus {
				isAllowed = true
				break
			}
		}
	}

	if !isAllowed {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_TRANSITION",
			fmt.Sprintf("Cannot transition lead from '%s' to '%s'", lead.Status, input.ToStatus)))
		return
	}

	// Terminal reason check
	if (input.ToStatus == "lost" || input.ToStatus == "invalid") && (input.Reason == nil || strings.TrimSpace(*input.Reason) == "") {
		errors.WriteJSON(w, r, errors.BadRequest("REASON_REQUIRED",
			fmt.Sprintf("Field 'reason' is required when transitioning lead to '%s'", input.ToStatus)))
		return
	}

	now := time.Now().UTC()
	updates := map[string]any{
		"status":          input.ToStatus,
		"terminal_reason": input.Reason,
		"updated_at":      now,
	}

	fromStatus := lead.Status
	toStatus := input.ToStatus
	act := models.LeadActivity{
		ID:         id.New(),
		LeadID:     leadID,
		ActorID:    &user.ID,
		Kind:       "status_changed",
		FromStatus: &fromStatus,
		ToStatus:   &toStatus,
		Note:       input.Note,
		CreatedAt:  now,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&lead).Updates(updates).Error; err != nil {
			return err
		}
		return tx.Create(&act).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to transition lead"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"leadId": leadID,
			"status": input.ToStatus,
		},
	})
}

func (h *Handler) AddLeadNote(w http.ResponseWriter, r *http.Request) {
	leadID := chi.URLParam(r, "id")
	user := identity.GetUserFromContext(r.Context())

	var input struct {
		Note string `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if strings.TrimSpace(input.Note) == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Note content is required"))
		return
	}

	var lead models.Lead
	if err := h.db.Where("id = ?", leadID).First(&lead).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Lead not found"))
		return
	}

	if !h.canAccessLead(user, &lead) {
		errors.WriteJSON(w, r, errors.Forbidden("Access forbidden"))
		return
	}

	act := models.LeadActivity{
		ID:        id.New(),
		LeadID:    leadID,
		ActorID:   &user.ID,
		Kind:      "note_added",
		Note:      &input.Note,
		CreatedAt: time.Now().UTC(),
	}

	if err := h.db.Create(&act).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to record activity note"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": act})
}

func (h *Handler) canAccessLead(user *identity.AuthUser, lead *models.Lead) bool {
	if user == nil {
		return false
	}
	for _, r := range user.Roles {
		if r == "super_admin" || r == "admin" {
			return true
		}
	}
	if user.BranchID == nil || lead.BranchID == nil {
		return true
	}
	return *user.BranchID == *lead.BranchID
}

func strPtr(s string) *string {
	return &s
}
