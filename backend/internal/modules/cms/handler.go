package cms

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/common/pagination"
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
	r.Get("/public/site-shell", h.GetPublicSiteShell)
	r.Get("/public/branches", h.GetPublicBranches)
	r.Get("/public/branches/{id}/channels", h.GetBranchChannels)
	r.Get("/public/pages/{pageKey}", h.GetPublicPage)

	// Admin protected routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))

		// Shell & Theme
		pr.Get("/admin/site-settings", h.GetSiteSettings)
		pr.Put("/admin/site-settings", h.UpdateSiteSettings)
		pr.Get("/admin/theme", h.GetTheme)
		pr.Put("/admin/theme", h.UpdateTheme)

		// Branches
		pr.Get("/admin/branches", h.ListBranches)
		pr.Post("/admin/branches", h.CreateBranch)
		pr.Put("/admin/branches/{id}", h.UpdateBranch)
		pr.Delete("/admin/branches/{id}", h.DeleteBranch)

		// Contact Channels
		pr.Get("/admin/contact-channels", h.ListContactChannels)
		pr.Post("/admin/contact-channels", h.CreateContactChannel)
		pr.Put("/admin/contact-channels/{id}", h.UpdateContactChannel)
		pr.Delete("/admin/contact-channels/{id}", h.DeleteContactChannel)

		// Navigation
		pr.Get("/admin/navigation", h.GetNavigation)
		pr.Post("/admin/navigation/items", h.CreateNavigationItem)
		pr.Put("/admin/navigation/items/{id}", h.UpdateNavigationItem)
		pr.Delete("/admin/navigation/items/{id}", h.DeleteNavigationItem)

		// Pages & Publishing Lifecycle
		pr.Get("/admin/pages", h.ListPages)
		pr.Post("/admin/pages", h.CreatePage)
		pr.Get("/admin/pages/{id}", h.GetPage)
		pr.Put("/admin/pages/{id}", h.UpdatePage)
		pr.Post("/admin/pages/{id}/revisions", h.CreatePageRevision)
		pr.Post("/admin/pages/{id}/publish", h.PublishPage)
		pr.Post("/admin/pages/{id}/unpublish", h.UnpublishPage)
		pr.Get("/admin/pages/{id}/revisions", h.ListPageRevisions)
		pr.Post("/admin/pages/{id}/restore/{revisionNo}", h.RestorePageRevision)
		pr.Get("/admin/pages/{id}/preview-token", h.GeneratePreviewToken)
	})
}

// ---------------- Public Endpoints ----------------

func (h *Handler) GetPublicSiteShell(w http.ResponseWriter, r *http.Request) {
	var siteSetting models.SiteSetting
	if err := h.db.First(&siteSetting).Error; err != nil {
		// safe defaults if not seeded yet
		siteSetting = models.SiteSetting{
			SiteName:            "BM SOLAR",
			DefaultLocale:       "vi-VN",
			SettingsRevision:    1,
			UtilityBarJSON:      `{"visible":true,"showHotline":true,"showEmail":true}`,
			FooterConfigJSON:    `{"legalText":"© 2026 BM SOLAR. Tất cả quyền được bảo lưu."}`,
			MobileActionBarJSON: `[{"key":"home","label":"Trang chủ","target":{"kind":"internalRoute","routeKey":"home"}},{"key":"products","label":"Sản phẩm","target":{"kind":"internalRoute","routeKey":"products"}},{"key":"call","label":"Gọi ngay","target":{"kind":"contactChannel","channelType":"phone"}},{"key":"zalo","label":"Zalo","target":{"kind":"contactChannel","channelType":"zalo"}},{"key":"menu","label":"Menu","target":{"kind":"internalRoute","routeKey":"menu"}}]`,
		}
	}

	var theme models.ThemeSetting
	if err := h.db.First(&theme).Error; err != nil {
		theme = models.ThemeSetting{
			PrimaryHex:  "#0D4EA6",
			NavyHex:     "#0D2E63",
			AccentHex:   "#FF6B19",
			FontsToken:  "inter",
			RadiusToken: "md",
		}
	}

	var branches []models.Branch
	h.db.Preload("Channels", "enabled = true").Where("is_active = true").Order("sort_order asc").Find(&branches)

	branchDTOs := make([]BranchDTO, 0, len(branches))
	for _, b := range branches {
		chans := make([]ChannelDTO, 0, len(b.Channels))
		for _, c := range b.Channels {
			target := c.Target
			if c.Type == "phone" {
				target = NormalizePhone(target)
			} else if c.Type == "zalo" {
				target = ValidateZaloTarget(target)
			}
			chans = append(chans, ChannelDTO{
				ID:        c.ID,
				Type:      c.Type,
				Label:     c.Label,
				Target:    target,
				Formatted: target,
				SortOrder: c.SortOrder,
			})
		}
		branchDTOs = append(branchDTOs, BranchDTO{
			ID:            b.ID,
			Code:          b.Code,
			Slug:          b.Slug,
			Name:          b.Name,
			StreetAddress: b.StreetAddress,
			GeoLat:        b.GeoLat,
			GeoLng:        b.GeoLng,
			IsActive:      b.IsActive,
			Channels:      chans,
		})
	}

	// Global channels
	var globalChannels []models.ContactChannel
	h.db.Where("branch_id IS NULL AND enabled = true").Order("sort_order asc").Find(&globalChannels)
	globalChanDTOs := make([]ChannelDTO, 0, len(globalChannels))
	var hotline, email string
	for _, c := range globalChannels {
		target := c.Target
		if c.Type == "phone" {
			target = NormalizePhone(target)
			if hotline == "" {
				hotline = target
			}
		} else if c.Type == "email" {
			if email == "" {
				email = target
			}
		} else if c.Type == "zalo" {
			target = ValidateZaloTarget(target)
		}
		globalChanDTOs = append(globalChanDTOs, ChannelDTO{
			ID:        c.ID,
			Type:      c.Type,
			Label:     c.Label,
			Target:    target,
			Formatted: target,
			SortOrder: c.SortOrder,
		})
	}

	// Navigation Tree
	var navItems []models.NavigationItem
	h.db.Where("menu_id = (SELECT id FROM navigation_menus WHERE menu_key = 'main_header' LIMIT 1)").
		Order("sort_order asc").Find(&navItems)

	navTree := buildNavigationTree(navItems, nil)

	var mobileActions []MobileActionDTO
	_ = json.Unmarshal([]byte(siteSetting.MobileActionBarJSON), &mobileActions)

	var footerConfig map[string]any
	_ = json.Unmarshal([]byte(siteSetting.FooterConfigJSON), &footerConfig)

	legalText := "© 2026 BM SOLAR"
	if lt, ok := footerConfig["legalText"].(string); ok && lt != "" {
		legalText = lt
	}

	logoURL := ""
	if siteSetting.LogoMediaID != nil {
		resolved, err := media.ResolvePublicURL(h.db, h.cfg, *siteSetting.LogoMediaID)
		if err != nil {
			errors.WriteJSON(w, r, errors.Internal("Failed to resolve logo"))
			return
		}
		logoURL = resolved
	}
	resp := SiteShellDTO{
		Brand: BrandDTO{
			Name: siteSetting.SiteName,
			Logo: LogoDTO{
				URL: logoURL,
				Alt: siteSetting.SiteName,
			},
		},
		UtilityBar: UtilityBarDTO{
			Visible:     true,
			Branches:    branchDTOs,
			ShowHotline: true,
			ShowEmail:   true,
			Hotline:     hotline,
			Email:       email,
		},
		Navigation: navTree,
		Footer: FooterDTO{
			Groups:      footerConfig["groups"],
			Branches:    branchDTOs,
			LegalText:   legalText,
			SocialLinks: globalChanDTOs,
		},
		MobileActions: mobileActions,
		Theme: ThemeDTO{
			Primary: theme.PrimaryHex,
			Navy:    theme.NavyHex,
			Accent:  theme.AccentHex,
			Fonts:   theme.FontsToken,
			Radius:  theme.RadiusToken,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": resp,
	})
}

func (h *Handler) GetPublicBranches(w http.ResponseWriter, r *http.Request) {
	activeOnly := r.URL.Query().Get("active") != "false"

	query := h.db.Preload("Channels", "enabled = true").Order("sort_order asc")
	if activeOnly {
		query = query.Where("is_active = true")
	}

	var branches []models.Branch
	if err := query.Find(&branches).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to list branches"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": branches,
	})
}

func (h *Handler) GetBranchChannels(w http.ResponseWriter, r *http.Request) {
	branchID := chi.URLParam(r, "id")

	// Branch-specific channels
	var channels []models.ContactChannel
	h.db.Where("branch_id = ? AND enabled = true", branchID).Order("sort_order asc").Find(&channels)

	// If no channels for branch, fallback to global channels (branch_id IS NULL)
	if len(channels) == 0 {
		h.db.Where("branch_id IS NULL AND enabled = true").Order("sort_order asc").Find(&channels)
	}

	type ResolvedChannel struct {
		Type      string `json:"type"`
		Label     string `json:"label"`
		Target    string `json:"target"`
		Formatted string `json:"formatted"`
		ActionURL string `json:"actionUrl"`
	}

	resolved := make([]ResolvedChannel, 0, len(channels))
	for _, c := range channels {
		actionURL := c.Target
		formatted := c.Target
		if c.Type == "phone" {
			phone := NormalizePhone(c.Target)
			formatted = phone
			actionURL = "tel:" + phone
		} else if c.Type == "zalo" {
			actionURL = ValidateZaloTarget(c.Target)
			formatted = actionURL
		} else if c.Type == "email" {
			actionURL = "mailto:" + c.Target
		}

		resolved = append(resolved, ResolvedChannel{
			Type:      c.Type,
			Label:     c.Label,
			Target:    c.Target,
			Formatted: formatted,
			ActionURL: actionURL,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": resolved,
	})
}

func (h *Handler) GetPublicPage(w http.ResponseWriter, r *http.Request) {
	pageKey := chi.URLParam(r, "pageKey")
	previewToken := r.URL.Query().Get("previewToken")

	var page models.Page
	if err := h.db.Where("page_key = ?", pageKey).First(&page).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Page not found"))
		return
	}

	var targetRevisionID string

	if previewToken != "" {
		// Validate preview token
		if !h.verifyPreviewToken(page.ID, previewToken) {
			errors.WriteJSON(w, r, errors.Forbidden("Invalid or expired preview token"))
			return
		}
		if page.CurrentDraftRevisionID != nil {
			targetRevisionID = *page.CurrentDraftRevisionID
		}
	} else {
		// Only serve published revision for public viewers
		if page.PublishedRevisionID == nil || page.PublicationState != "published" {
			errors.WriteJSON(w, r, errors.NotFound("Page is not published"))
			return
		}
		targetRevisionID = *page.PublishedRevisionID
	}

	var revision models.PageRevision
	if err := h.db.Where("id = ?", targetRevisionID).First(&revision).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Page revision not found"))
		return
	}

	var blocks []Block
	if err := json.Unmarshal([]byte(revision.BlocksJSON), &blocks); err != nil {
		blocks = []Block{}
	}

	if err := h.hydrateMedia(blocks); err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to resolve page media"))
		return
	}

	var seo any
	if revision.SeoJSON != nil && *revision.SeoJSON != "" {
		_ = json.Unmarshal([]byte(*revision.SeoJSON), &seo)
	}

	// Compute ETag based on revision ID
	etag := fmt.Sprintf(`W/"%s-%d"`, revision.ID, revision.RevisionNo)
	if match := r.Header.Get("If-None-Match"); match == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	w.Header().Set("ETag", etag)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")

	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"pageKey":          page.PageKey,
			"slug":             page.RouteSlug,
			"title":            page.Title,
			"locale":           page.Locale,
			"publicationState": page.PublicationState,
			"revisionNo":       revision.RevisionNo,
			"blocks":           blocks,
			"seo":              seo,
		},
	})
}

// ---------------- Admin Endpoints ----------------

func (h *Handler) GetSiteSettings(w http.ResponseWriter, r *http.Request) {
	var settings models.SiteSetting
	h.db.First(&settings)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": settings,
	})
}

func (h *Handler) UpdateSiteSettings(w http.ResponseWriter, r *http.Request) {
	var input struct {
		LogoMediaID         *string `json:"logoMediaId"`
		SiteName            string  `json:"siteName"`
		DefaultLocale       string  `json:"defaultLocale"`
		DefaultBranchID     *string `json:"defaultBranchId"`
		UtilityBarJSON      string  `json:"utilityBarJson"`
		FooterConfigJSON    string  `json:"footerConfigJson"`
		MobileActionBarJSON string  `json:"mobileActionBarJson"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed request body"))
		return
	}

	var settings models.SiteSetting
	if err := h.db.First(&settings).Error; err != nil {
		settings = models.SiteSetting{
			ID:                  id.New(),
			LogoMediaID:         input.LogoMediaID,
			SiteName:            input.SiteName,
			DefaultLocale:       input.DefaultLocale,
			DefaultBranchID:     input.DefaultBranchID,
			UtilityBarJSON:      input.UtilityBarJSON,
			FooterConfigJSON:    input.FooterConfigJSON,
			MobileActionBarJSON: input.MobileActionBarJSON,
			SettingsRevision:    1,
		}
		h.db.Create(&settings)
	} else {
		settings.LogoMediaID = input.LogoMediaID
		settings.SiteName = input.SiteName
		settings.DefaultLocale = input.DefaultLocale
		settings.DefaultBranchID = input.DefaultBranchID
		settings.UtilityBarJSON = input.UtilityBarJSON
		settings.FooterConfigJSON = input.FooterConfigJSON
		settings.MobileActionBarJSON = input.MobileActionBarJSON
		settings.SettingsRevision++
		h.db.Save(&settings)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": settings,
	})
}

func (h *Handler) GetTheme(w http.ResponseWriter, r *http.Request) {
	var theme models.ThemeSetting
	h.db.First(&theme)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": theme,
	})
}

func (h *Handler) UpdateTheme(w http.ResponseWriter, r *http.Request) {
	var input struct {
		PrimaryHex  string `json:"primaryHex"`
		NavyHex     string `json:"navyHex"`
		AccentHex   string `json:"accentHex"`
		FontsToken  string `json:"fontsToken"`
		RadiusToken string `json:"radiusToken"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	var theme models.ThemeSetting
	if err := h.db.First(&theme).Error; err != nil {
		theme = models.ThemeSetting{
			ID:          id.New(),
			SiteID:      "default",
			PrimaryHex:  input.PrimaryHex,
			NavyHex:     input.NavyHex,
			AccentHex:   input.AccentHex,
			FontsToken:  input.FontsToken,
			RadiusToken: input.RadiusToken,
		}
		h.db.Create(&theme)
	} else {
		theme.PrimaryHex = input.PrimaryHex
		theme.NavyHex = input.NavyHex
		theme.AccentHex = input.AccentHex
		theme.FontsToken = input.FontsToken
		theme.RadiusToken = input.RadiusToken
		h.db.Save(&theme)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": theme,
	})
}

func (h *Handler) ListBranches(w http.ResponseWriter, r *http.Request) {
	var branches []models.Branch
	h.db.Preload("Channels").Order("sort_order asc").Find(&branches)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": branches,
	})
}

func (h *Handler) CreateBranch(w http.ResponseWriter, r *http.Request) {
	var b models.Branch
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	b.ID = id.New()

	if err := h.db.Create(&b).Error; err != nil {
		errors.WriteJSON(w, r, errors.Conflict("BRANCH_EXISTS", "Branch code or slug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": b,
	})
}

func (h *Handler) UpdateBranch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var existing models.Branch
	if err := h.db.Where("id = ?", id).First(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Branch not found"))
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&existing); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	h.db.Save(&existing)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": existing,
	})
}

func (h *Handler) DeleteBranch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Where("branch_id = ?", id).Delete(&models.ContactChannel{})
	h.db.Delete(&models.Branch{}, "id = ?", id)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}

func (h *Handler) ListContactChannels(w http.ResponseWriter, r *http.Request) {
	var channels []models.ContactChannel
	h.db.Order("sort_order asc").Find(&channels)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": channels,
	})
}

func (h *Handler) CreateContactChannel(w http.ResponseWriter, r *http.Request) {
	var c models.ContactChannel
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	c.ID = id.New()
	if c.Type == "phone" {
		c.Target = NormalizePhone(c.Target)
	} else if c.Type == "zalo" {
		c.Target = ValidateZaloTarget(c.Target)
	}

	h.db.Create(&c)
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": c,
	})
}

func (h *Handler) UpdateContactChannel(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var existing models.ContactChannel
	if err := h.db.Where("id = ?", id).First(&existing).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Channel not found"))
		return
	}

	_ = json.NewDecoder(r.Body).Decode(&existing)
	if existing.Type == "phone" {
		existing.Target = NormalizePhone(existing.Target)
	} else if existing.Type == "zalo" {
		existing.Target = ValidateZaloTarget(existing.Target)
	}

	h.db.Save(&existing)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": existing,
	})
}

func (h *Handler) DeleteContactChannel(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Delete(&models.ContactChannel{}, "id = ?", id)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}

func (h *Handler) GetNavigation(w http.ResponseWriter, r *http.Request) {
	var items []models.NavigationItem
	h.db.Order("sort_order asc").Find(&items)
	tree := buildNavigationTree(items, nil)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": tree,
	})
}

func (h *Handler) CreateNavigationItem(w http.ResponseWriter, r *http.Request) {
	var item models.NavigationItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}
	item.ID = id.New()
	h.db.Create(&item)

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": item,
	})
}

func (h *Handler) UpdateNavigationItem(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var item models.NavigationItem
	if err := h.db.Where("id = ?", id).First(&item).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Navigation item not found"))
		return
	}
	_ = json.NewDecoder(r.Body).Decode(&item)
	h.db.Save(&item)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": item,
	})
}

func (h *Handler) DeleteNavigationItem(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	h.db.Delete(&models.NavigationItem{}, "id = ? OR parent_id = ?", id, id)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}

// ---------------- Pages Publishing ----------------

func (h *Handler) ListPages(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.Page{}).Count(&total)

	var pages []models.Page
	h.db.Offset(p.Offset).Limit(p.PageSize).Order("created_at desc").Find(&pages)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[models.Page]{
		Data: pages,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) CreatePage(w http.ResponseWriter, r *http.Request) {
	var input struct {
		PageKey    string  `json:"pageKey"`
		RouteSlug  string  `json:"routeSlug"`
		Title      string  `json:"title"`
		Locale     string  `json:"locale"`
		BlocksJSON string  `json:"blocksJson"`
		SeoJSON    *string `json:"seoJson"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	if input.PageKey == "" || input.Title == "" || input.RouteSlug == "" {
		errors.WriteJSON(w, r, errors.BadRequest("VALIDATION_ERROR", "pageKey, routeSlug, and title are required"))
		return
	}

	if input.Locale == "" {
		input.Locale = "vi-VN"
	}
	if input.BlocksJSON == "" {
		input.BlocksJSON = "[]"
	}

	pageID := id.New()
	revisionID := id.New()
	user := identity.GetUserFromContext(r.Context())
	var actorID *string
	if user != nil {
		actorID = &user.ID
	}

	page := models.Page{
		ID:                     pageID,
		PageKey:                input.PageKey,
		RouteSlug:              input.RouteSlug,
		Title:                  input.Title,
		Locale:                 input.Locale,
		PublicationState:       "draft",
		CurrentDraftRevisionID: &revisionID,
	}

	rev := models.PageRevision{
		ID:         revisionID,
		PageID:     pageID,
		RevisionNo: 1,
		BlocksJSON: input.BlocksJSON,
		SeoJSON:    input.SeoJSON,
		CreatedBy:  actorID,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&page).Error; err != nil {
			return err
		}
		return tx.Create(&rev).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Conflict("PAGE_EXISTS", "PageKey or RouteSlug already exists"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": page,
	})
}

func (h *Handler) GetPage(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var page models.Page
	if err := h.db.Preload("Revisions").Where("id = ?", id).First(&page).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Page not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": page,
	})
}

func (h *Handler) UpdatePage(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var page models.Page
	if err := h.db.Where("id = ?", id).First(&page).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Page not found"))
		return
	}

	var input struct {
		Title     string `json:"title"`
		RouteSlug string `json:"routeSlug"`
	}
	_ = json.NewDecoder(r.Body).Decode(&input)
	if input.Title != "" {
		page.Title = input.Title
	}
	if input.RouteSlug != "" {
		page.RouteSlug = input.RouteSlug
	}

	h.db.Save(&page)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": page,
	})
}

func (h *Handler) CreatePageRevision(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")

	var input struct {
		BlocksJSON string  `json:"blocksJson"`
		SeoJSON    *string `json:"seoJson"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_JSON", "Malformed body"))
		return
	}

	// Validate blocks JSON
	var blocks []Block
	if err := json.Unmarshal([]byte(input.BlocksJSON), &blocks); err != nil {
		errors.WriteJSON(w, r, errors.Unprocessable("INVALID_BLOCKS_JSON", "Blocks payload must be valid JSON array of blocks"))
		return
	}
	for _, b := range blocks {
		if err := ValidateBlock(&b); err != nil {
			errors.WriteJSON(w, r, errors.Unprocessable("INVALID_BLOCK_SCHEMA", err.Error()))
			return
		}
	}

	var latestRev models.PageRevision
	h.db.Where("page_id = ?", pageID).Order("revision_no desc").First(&latestRev)

	nextRevNo := latestRev.RevisionNo + 1
	revID := id.New()
	user := identity.GetUserFromContext(r.Context())
	var actorID *string
	if user != nil {
		actorID = &user.ID
	}

	newRev := models.PageRevision{
		ID:         revID,
		PageID:     pageID,
		RevisionNo: nextRevNo,
		BlocksJSON: input.BlocksJSON,
		SeoJSON:    input.SeoJSON,
		CreatedBy:  actorID,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&newRev).Error; err != nil {
			return err
		}
		return tx.Model(&models.Page{}).Where("id = ?", pageID).
			Update("current_draft_revision_id", revID).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to save revision"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": newRev,
	})
}

func (h *Handler) PublishPage(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")

	var page models.Page
	if err := h.db.Where("id = ?", pageID).First(&page).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Page not found"))
		return
	}

	if page.CurrentDraftRevisionID == nil {
		errors.WriteJSON(w, r, errors.Unprocessable("NO_REVISION", "No revision available to publish"))
		return
	}

	now := time.Now().UTC()
	err := h.db.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&page).Updates(map[string]any{
			"published_revision_id": page.CurrentDraftRevisionID,
			"publication_state":     "published",
			"updated_at":            now,
		}).Error
	})

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to publish page"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"pageId":              page.ID,
			"publishedRevisionId": page.CurrentDraftRevisionID,
			"status":              "published",
		},
	})
}

func (h *Handler) UnpublishPage(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")

	err := h.db.Model(&models.Page{}).Where("id = ?", pageID).Updates(map[string]any{
		"published_revision_id": nil,
		"publication_state":     "draft",
	}).Error

	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to unpublish page"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"pageId": pageID,
			"status": "draft",
		},
	})
}

func (h *Handler) ListPageRevisions(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")

	var revs []models.PageRevision
	h.db.Where("page_id = ?", pageID).Order("revision_no desc").Find(&revs)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": revs,
	})
}

func (h *Handler) RestorePageRevision(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")
	revNoStr := chi.URLParam(r, "revisionNo")
	revNo, err := strconv.Atoi(revNoStr)
	if err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_PARAM", "Invalid revision number"))
		return
	}

	var targetRev models.PageRevision
	if err := h.db.Where("page_id = ? AND revision_no = ?", pageID, revNo).First(&targetRev).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Revision not found"))
		return
	}

	var latestRev models.PageRevision
	h.db.Where("page_id = ?", pageID).Order("revision_no desc").First(&latestRev)

	// In accordance with ADR: restore creates a brand NEW revision from old snapshot
	newRevID := id.New()
	user := identity.GetUserFromContext(r.Context())
	var actorID *string
	if user != nil {
		actorID = &user.ID
	}

	restoredRev := models.PageRevision{
		ID:         newRevID,
		PageID:     pageID,
		RevisionNo: latestRev.RevisionNo + 1,
		BlocksJSON: targetRev.BlocksJSON,
		SeoJSON:    targetRev.SeoJSON,
		CreatedBy:  actorID,
	}

	_ = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&restoredRev).Error; err != nil {
			return err
		}
		return tx.Model(&models.Page{}).Where("id = ?", pageID).
			Update("current_draft_revision_id", newRevID).Error
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": restoredRev,
	})
}

func (h *Handler) GeneratePreviewToken(w http.ResponseWriter, r *http.Request) {
	pageID := chi.URLParam(r, "id")
	token := h.signPreviewToken(pageID)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]string{
			"previewToken": token,
			"pageId":       pageID,
		},
	})
}

func (h *Handler) signPreviewToken(pageID string) string {
	exp := time.Now().Add(1 * time.Hour).Unix()
	payload := fmt.Sprintf("%s:%d", pageID, exp)
	mac := hmac.New(sha256.New, []byte(h.cfg.JWTAccessSecret))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s:%s", payload, sig)
}

func (h *Handler) verifyPreviewToken(pageID, token string) bool {
	parts := strings.Split(token, ":")
	if len(parts) != 3 {
		return false
	}
	pID, expStr, sig := parts[0], parts[1], parts[2]
	if pID != pageID {
		return false
	}
	exp, err := strconv.ParseInt(expStr, 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return false
	}

	payload := fmt.Sprintf("%s:%s", pID, expStr)
	mac := hmac.New(sha256.New, []byte(h.cfg.JWTAccessSecret))
	mac.Write([]byte(payload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(sig), []byte(expectedSig))
}

func buildNavigationTree(items []models.NavigationItem, parentID *string) []NavigationNodeDTO {
	nodes := make([]NavigationNodeDTO, 0)
	for _, it := range items {
		isChildOfParent := (parentID == nil && it.ParentID == nil) ||
			(parentID != nil && it.ParentID != nil && *parentID == *it.ParentID)
		if isChildOfParent {
			idCopy := it.ID
			children := buildNavigationTree(items, &idCopy)
			nodes = append(nodes, NavigationNodeDTO{
				ID:          it.ID,
				Label:       it.Label,
				TargetKind:  it.TargetKind,
				TargetRef:   it.TargetRef,
				ExternalURL: it.ExternalURL,
				SortOrder:   it.SortOrder,
				Visibility:  it.Visibility,
				Children:    children,
			})
		}
	}
	return nodes
}
