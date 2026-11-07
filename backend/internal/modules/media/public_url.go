package media

import (
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"errors"
	"gorm.io/gorm"
)

// ResolvePublicURL translates a database media ID to its real storage key.
func ResolvePublicURL(db *gorm.DB, cfg *config.Config, mediaID string) (string, error) {
	if mediaID == "" {
		return "", nil
	}
	var asset models.MediaAsset
	err := db.Select("storage_key").Where("id = ? AND status = ?", mediaID, "ready").First(&asset).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return cfg.ResolveMediaURL(asset.StorageKey), nil
}
