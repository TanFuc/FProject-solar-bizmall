package media

import (
	apierrors "bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"net/http"
)

// ReplaceMedia preserves original files and updates the effective image used by references.
func (h *Handler) ReplaceMedia(w http.ResponseWriter, r *http.Request) {
	sourceID := chi.URLParam(r, "id")
	var rawInput struct {
		ReplacementID json.RawMessage `json:"replacementId"`
	}
	var input struct{ ReplacementID *string }
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&rawInput); err != nil {
		apierrors.WriteJSON(w, r, apierrors.BadRequest("INVALID_JSON", "A replacementId or explicit null is required"))
		return
	}
	if len(rawInput.ReplacementID) == 0 {
		apierrors.WriteJSON(w, r, apierrors.BadRequest("INVALID_REPLACEMENT", "Provide replacementId or explicit null"))
		return
	}
	if err := json.Unmarshal(rawInput.ReplacementID, &input.ReplacementID); err != nil {
		apierrors.WriteJSON(w, r, apierrors.BadRequest("INVALID_REPLACEMENT", "Replacement must be a media ID or null"))
		return
	}
	var source models.MediaAsset
	if err := h.db.First(&source, "id = ? AND status = ?", sourceID, "ready").Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			apierrors.WriteJSON(w, r, apierrors.NotFound("Media asset not found"))
		} else {
			apierrors.WriteJSON(w, r, apierrors.Internal("Failed to read media"))
		}
		return
	}
	if input.ReplacementID != nil {
		if *input.ReplacementID == "" {
			apierrors.WriteJSON(w, r, apierrors.BadRequest("INVALID_REPLACEMENT", "Replacement cannot be empty"))
			return
		}
		visited := map[string]bool{sourceID: true}
		next := *input.ReplacementID
		for depth := 1; next != ""; depth++ {
			if depth >= 8 || visited[next] {
				apierrors.WriteJSON(w, r, apierrors.Unprocessable("MEDIA_REPLACEMENT_CYCLE", "Media replacements cannot form a cycle or exceed eight levels"))
				return
			}
			visited[next] = true
			var target models.MediaAsset
			if err := h.db.Select("id", "replacement_id").First(&target, "id = ? AND status = ?", next, "ready").Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					apierrors.WriteJSON(w, r, apierrors.NotFound("Replacement asset not found"))
				} else {
					apierrors.WriteJSON(w, r, apierrors.Internal("Failed to read replacement"))
				}
				return
			}
			next = ""
			if target.ReplacementID != nil {
				next = *target.ReplacementID
			}
		}
	}
	oldReplacement := source.ReplacementID
	actor := identity.GetUserFromContext(r.Context())
	var actorID *string
	if actor != nil {
		actorID = &actor.ID
	}
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&source).Update("replacement_id", input.ReplacementID).Error; err != nil {
			return err
		}
		return tx.Create(&models.AuditLog{ID: id.New(), ActorID: actorID, Action: "media.replace", EntityType: "media", EntityID: sourceID, OldValueRedacted: oldReplacement, NewValueRedacted: input.ReplacementID}).Error
	}); err != nil {
		apierrors.WriteJSON(w, r, apierrors.Internal("Failed to save media replacement"))
		return
	}
	url, err := ResolvePublicURL(h.db, h.cfg, sourceID)
	if err != nil {
		apierrors.WriteJSON(w, r, apierrors.Internal("Failed to resolve updated media"))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Data struct {
			ID            string  `json:"id"`
			ReplacementID *string `json:"replacementId"`
			URL           string  `json:"url"`
		} `json:"data"`
	}{Data: struct {
		ID            string  `json:"id"`
		ReplacementID *string `json:"replacementId"`
		URL           string  `json:"url"`
	}{sourceID, input.ReplacementID, url}}); err != nil {
		return
	}
}
