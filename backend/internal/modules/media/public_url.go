package media

import (
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"errors"
	"fmt"
	"gorm.io/gorm"
)

// ResolvePublicURL follows reversible replacements and resolves the real storage key.
func ResolvePublicURL(db *gorm.DB, cfg *config.Config, mediaID string) (string, error) {
	visited := make(map[string]bool)
	for depth := 0; mediaID != ""; depth++ {
		if depth >= 8 || visited[mediaID] {
			return "", fmt.Errorf("invalid media replacement chain")
		}
		visited[mediaID] = true
		var asset models.MediaAsset
		err := db.Select("storage_key", "replacement_id").Where("id = ? AND status = ?", mediaID, "ready").First(&asset).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil
		}
		if err != nil {
			return "", err
		}
		if asset.ReplacementID == nil || *asset.ReplacementID == "" {
			return cfg.ResolveMediaURL(asset.StorageKey), nil
		}
		mediaID = *asset.ReplacementID
	}
	return "", nil
}
