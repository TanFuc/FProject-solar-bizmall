package cms

import (
	"encoding/json"
	"net/http"
	"strings"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"
	"gorm.io/gorm"
)

func (h *Handler) UpdateSiteTranslations(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 256<<10)
	var input struct {
		Labels map[string]string `json:"labels"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Labels == nil || len(input.Labels) > 1000 {
		errors.WriteJSON(w, r, errors.BadRequest("INVALID_TRANSLATIONS", "Invalid English labels"))
		return
	}
	for key, value := range input.Labels {
		if strings.TrimSpace(key) == "" || len(key) > 1500 || len(value) > 3000 {
			errors.WriteJSON(w, r, errors.BadRequest("INVALID_TRANSLATIONS", "Invalid English label length"))
			return
		}
	}
	data, err := json.Marshal(input.Labels)
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Could not encode English labels"))
		return
	}
	err = h.db.Transaction(func(tx *gorm.DB) error {
		var settings models.SiteSetting
		if err := tx.First(&settings).Error; err != nil {
			return err
		}
		if err := tx.Model(&settings).Update("english_labels_json", string(data)).Error; err != nil {
			return err
		}
		return identity.AuditContentWrite(tx, r.Context(), "update_english_labels", "site_settings", settings.ID)
	})
	if err != nil {
		errors.WriteJSON(w, r, errors.Internal("Could not save English labels"))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(struct {
		Data map[string]string `json:"data"`
	}{input.Labels})
}
