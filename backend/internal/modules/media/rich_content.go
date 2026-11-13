package media

import (
	"bmsolar-backend/internal/common/richcontent"
	"bmsolar-backend/internal/config"

	"gorm.io/gorm"
)

func ResolveRichContent(db *gorm.DB, cfg *config.Config, stored string) (string, error) {
	urls := make(map[string]string)
	return richcontent.Process(stored, func(id string) (string, error) {
		if url, ok := urls[id]; ok {
			return url, nil
		}
		url, err := ResolvePublicURL(db, cfg, id)
		if err != nil {
			return "", err
		}
		urls[id] = url
		return url, nil
	})
}
