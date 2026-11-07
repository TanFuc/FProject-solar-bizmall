package identity

import (
	"encoding/json"
	"net/http"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
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
	// Public auth routes
	r.Post("/admin/auth/login", h.Login)
	r.Post("/admin/auth/refresh", h.Refresh)
	r.Post("/admin/auth/logout", h.Logout)

	// Protected auth & identity routes
	r.Group(func(pr chi.Router) {
		pr.Use(RequireAuth(h.cfg))
		pr.Get("/admin/auth/me", h.Me)

		pr.Group(func(ur chi.Router) {
			ur.Use(RequirePermission("identity.user.manage"))
			ur.Get("/admin/users", h.ListUsers)
			ur.Post("/admin/users", h.CreateUser)
			ur.Get("/admin/roles", h.ListRoles)
			ur.Get("/admin/permissions", h.ListPermissions)
		})
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         *AuthUser `json:"user"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed request body"))
		return
	}

	if req.Email == "" || req.Password == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Email and password are required"))
		return
	}

	var user models.User
	if err := h.db.Preload("Roles.Permissions").Where("email = ? AND status = 'active'", req.Email).First(&user).Error; err != nil {
		errors.WriteJSON(w, r, errors.Unauthorized("Invalid email or password"))
		return
	}

	if !CheckPassword(req.Password, user.PasswordHash) {
		errors.WriteJSON(w, r, errors.Unauthorized("Invalid email or password"))
		return
	}

	authUser := BuildAuthUser(&user)
	accessToken, refreshToken, err := GenerateTokens(h.cfg, authUser)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to generate tokens"))
		return
	}

	// Set refresh token in httpOnly secure cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/v1/admin/auth",
		HttpOnly: true,
		Secure:   h.cfg.Env == "production",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   h.cfg.JWTRefreshTTLSeconds,
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": LoginResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			User:         authUser,
		},
	})
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	refreshToken := body.RefreshToken
	if refreshToken == "" {
		if cookie, err := r.Cookie("refresh_token"); err == nil {
			refreshToken = cookie.Value
		}
	}

	if refreshToken == "" {
		errors.WriteJSON(w, r, errors.Unauthorized("Refresh token required"))
		return
	}

	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(h.cfg.JWTRefreshSecret), nil
	})

	if err != nil || !token.Valid {
		errors.WriteJSON(w, r, errors.Unauthorized("Invalid or expired refresh token"))
		return
	}

	var user models.User
	if err := h.db.Preload("Roles.Permissions").Where("id = ? AND status = 'active'", claims.Subject).First(&user).Error; err != nil {
		errors.WriteJSON(w, r, errors.Unauthorized("User not found or inactive"))
		return
	}

	authUser := BuildAuthUser(&user)
	accessToken, newRefreshToken, err := GenerateTokens(h.cfg, authUser)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to rotate tokens"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": LoginResponse{
			AccessToken:  accessToken,
			RefreshToken: newRefreshToken,
			User:         authUser,
		},
	})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/v1/admin/auth",
		HttpOnly: true,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r.Context())
	if user == nil {
		errors.WriteJSON(w, r, errors.Unauthorized("Unauthorized"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": user,
	})
}

func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.User{}).Count(&total)

	var users []models.User
	if err := h.db.Preload("Roles").Offset(p.Offset).Limit(p.PageSize).Find(&users).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list users"))
		return
	}

	type UserSummary struct {
		ID          string    `json:"id"`
		Email       string    `json:"email"`
		DisplayName string    `json:"displayName"`
		BranchID    *string   `json:"branchId"`
		Status      string    `json:"status"`
		Roles       []string  `json:"roles"`
		CreatedAt   time.Time `json:"createdAt"`
	}

	summaries := make([]UserSummary, 0, len(users))
	for _, u := range users {
		roles := make([]string, 0, len(u.Roles))
		for _, rl := range u.Roles {
			roles = append(roles, rl.Code)
		}
		summaries = append(summaries, UserSummary{
			ID:          u.ID,
			Email:       u.Email,
			DisplayName: u.DisplayName,
			BranchID:    u.BranchID,
			Status:      u.Status,
			Roles:       roles,
			CreatedAt:   u.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[UserSummary]{
		Data: summaries,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

type CreateUserRequest struct {
	Email       string   `json:"email"`
	Password    string   `json:"password"`
	DisplayName string   `json:"displayName"`
	BranchID    *string  `json:"branchId"`
	RoleCodes   []string `json:"roleCodes"`
}

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed request body"))
		return
	}

	if req.Email == "" || len(req.Password) < 8 || req.DisplayName == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "Email, password (min 8 chars), and displayName are required"))
		return
	}

	var existing models.User
	if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		errors.WriteJSON(w, r, errors.Conflict("USER_EXISTS", "User with this email already exists"))
		return
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to hash password"))
		return
	}

	user := models.User{
		ID:           id.New(),
		Email:        req.Email,
		PasswordHash: hash,
		DisplayName:  req.DisplayName,
		BranchID:     req.BranchID,
		Status:       "active",
	}

	if err := h.db.Create(&user).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to create user"))
		return
	}

	if len(req.RoleCodes) > 0 {
		var roles []models.Role
		h.db.Where("code IN ?", req.RoleCodes).Find(&roles)
		for _, role := range roles {
			_ = h.db.Create(&models.UserRole{UserID: user.ID, RoleID: role.ID}).Error
		}
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"id":          user.ID,
			"email":       user.Email,
			"displayName": user.DisplayName,
		},
	})
}

func (h *Handler) ListRoles(w http.ResponseWriter, r *http.Request) {
	var roles []models.Role
	if err := h.db.Preload("Permissions").Find(&roles).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list roles"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": roles,
	})
}

func (h *Handler) ListPermissions(w http.ResponseWriter, r *http.Request) {
	var permissions []models.Permission
	if err := h.db.Find(&permissions).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list permissions"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": permissions,
	})
}
