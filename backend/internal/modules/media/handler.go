package media

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/pagination"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type Handler struct {
	db      *gorm.DB
	cfg     *config.Config
	service *Service
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:      db,
		cfg:     cfg,
		service: NewService(cfg),
	}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	// Public static media file server
	r.Get("/media/{key}", h.ServeFile)

	// Admin media routes
	r.Group(func(pr chi.Router) {
		pr.Use(identity.RequireAuth(h.cfg))
		pr.Get("/admin/media", h.ListMedia)
		pr.Get("/admin/media/{id}", h.GetMedia)
		pr.Post("/admin/media/upload", h.Upload)
		pr.Delete("/admin/media/{id}", h.DeleteMedia)
	})
}

func (h *Handler) getStoragePath() string {
	if h.cfg.LocalStoragePath != "" {
		return h.cfg.LocalStoragePath
	}
	if h.cfg.StorageDir != "" {
		return h.cfg.StorageDir
	}
	return "./storage"
}

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	maxMB := h.cfg.MaxUploadMB
	if maxMB <= 0 {
		maxMB = 25
	}
	maxBytes := int64(maxMB) << 20

	if err := r.ParseMultipartForm(maxBytes); err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("UPLOAD_TOO_LARGE", fmt.Sprintf("File exceeds maximum upload size (%dMB)", maxMB)))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		errors.WriteJSON(w, r, errors.BadRequest("MISSING_FILE", "Form field 'file' is required"))
		return
	}
	defer file.Close()

	if header.Size > maxBytes {
		errors.WriteJSON(w, r, errors.BadRequest("UPLOAD_TOO_LARGE", fmt.Sprintf("File size exceeds maximum upload size (%dMB)", maxMB)))
		return
	}

	user := identity.GetUserFromContext(r.Context())
	var uploaderID *string
	if user != nil {
		uploaderID = &user.ID
	}

	result, err := h.service.SaveUploadedFile(file, header, uploaderID)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal(fmt.Sprintf("Failed to save uploaded file: %v", err)))
		return
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&result.Asset).Error; err != nil {
			return err
		}
		if len(result.Variants) > 0 {
			if err := tx.Create(&result.Variants).Error; err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to persist uploaded media"))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"id":           result.Asset.ID,
			"storageKey":   result.Asset.StorageKey,
			"url":          result.AssetURL,
			"originalName": result.Asset.OriginalName,
			"mimeType":     result.Asset.MimeType,
			"bytes":        result.Asset.Bytes,
			"width":        result.Asset.Width,
			"height":       result.Asset.Height,
			"variants":     result.VariantURLs,
		},
	})
}

func (h *Handler) ListMedia(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r)

	var total int64
	h.db.Model(&models.MediaAsset{}).Count(&total)

	var assets []models.MediaAsset
	if err := h.db.Preload("Variants").Order("created_at desc").Offset(p.Offset).Limit(p.PageSize).Find(&assets).Error; err != nil {
		errors.WriteJSON(w, r, errors.Internal("Failed to query media assets"))
		return
	}

	type VariantDTO struct {
		VariantKey string `json:"variantKey"`
		StorageKey string `json:"storageKey"`
		URL        string `json:"url"`
		Width      int    `json:"width"`
		Height     int    `json:"height"`
		SizeBytes  int    `json:"sizeBytes"`
	}

	type MediaAssetDTO struct {
		ID           string       `json:"id"`
		StorageKey   string       `json:"storageKey"`
		URL          string       `json:"url"`
		OriginalName string       `json:"originalName"`
		MimeType     string       `json:"mimeType"`
		Bytes        int          `json:"bytes"`
		Width        *int         `json:"width"`
		Height       *int         `json:"height"`
		AltText      *string      `json:"altText"`
		Variants     []VariantDTO `json:"variants"`
	}

	dtos := make([]MediaAssetDTO, 0, len(assets))
	for _, a := range assets {
		var variantDTOs []VariantDTO
		for _, v := range a.Variants {
			variantDTOs = append(variantDTOs, VariantDTO{
				VariantKey: v.VariantKey,
				StorageKey: v.StorageKey,
				URL:        h.cfg.ResolveMediaURL(v.StorageKey),
				Width:      v.Width,
				Height:     v.Height,
				SizeBytes:  v.SizeBytes,
			})
		}

		dtos = append(dtos, MediaAssetDTO{
			ID:           a.ID,
			StorageKey:   a.StorageKey,
			URL:          h.cfg.ResolveMediaURL(a.StorageKey),
			OriginalName: a.OriginalName,
			MimeType:     a.MimeType,
			Bytes:        a.Bytes,
			Width:        a.Width,
			Height:       a.Height,
			AltText:      a.AltText,
			Variants:     variantDTOs,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(pagination.PaginatedResponse[MediaAssetDTO]{
		Data: dtos,
		Meta: pagination.BuildMeta(int(total), p.Page, p.PageSize),
	})
}

func (h *Handler) GetMedia(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var asset models.MediaAsset
	if err := h.db.Preload("Variants").Where("id = ?", id).First(&asset).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Media asset not found"))
		return
	}

	type VariantDTO struct {
		VariantKey string `json:"variantKey"`
		StorageKey string `json:"storageKey"`
		URL        string `json:"url"`
		Width      int    `json:"width"`
		Height     int    `json:"height"`
		SizeBytes  int    `json:"sizeBytes"`
	}

	var variantDTOs []VariantDTO
	for _, v := range asset.Variants {
		variantDTOs = append(variantDTOs, VariantDTO{
			VariantKey: v.VariantKey,
			StorageKey: v.StorageKey,
			URL:        h.cfg.ResolveMediaURL(v.StorageKey),
			Width:      v.Width,
			Height:     v.Height,
			SizeBytes:  v.SizeBytes,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]any{
			"id":           asset.ID,
			"storageKey":   asset.StorageKey,
			"url":          h.cfg.ResolveMediaURL(asset.StorageKey),
			"originalName": asset.OriginalName,
			"mimeType":     asset.MimeType,
			"bytes":        asset.Bytes,
			"width":        asset.Width,
			"height":       asset.Height,
			"altText":      asset.AltText,
			"variants":     variantDTOs,
		},
	})
}

func (h *Handler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Reference check: avoid deleting media used in published items
	var productCount int64
	h.db.Model(&models.Product{}).Where("cover_media_id = ?", id).Count(&productCount)
	if productCount > 0 {
		errors.WriteJSON(w, r, errors.Conflict("MEDIA_REFERENCED", "Cannot delete media asset referenced by published products"))
		return
	}

	var asset models.MediaAsset
	if err := h.db.Where("id = ?", id).First(&asset).Error; err != nil {
		errors.WriteJSON(w, r, errors.NotFound("Media asset not found"))
		return
	}

	_ = h.db.Where("asset_id = ?", id).Delete(&models.MediaVariant{})
	_ = h.db.Delete(&asset)

	filePath := filepath.Join(h.getStoragePath(), asset.StorageKey)
	_ = os.Remove(filePath)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"data": map[string]bool{"success": true},
	})
}

func (h *Handler) ServeFile(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "key")
	cleaned := filepath.Clean(key)
	if strings.Contains(cleaned, "..") || strings.HasPrefix(cleaned, "/") || strings.HasPrefix(cleaned, "\\") {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	fullPath := filepath.Join(h.getStoragePath(), cleaned)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		http.NotFound(w, r)
		return
	}

	// Caching header for CDN/browsers: public, 1 year cache
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	http.ServeFile(w, r, fullPath)
}
