package identity

import (
	"context"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/database/models"

	"gorm.io/gorm"
)

// AuditContentWrite records the operator and entity without storing editorial content in the log.
func AuditContentWrite(tx *gorm.DB, ctx context.Context, action, entity, entityID string) error {
	entry := models.AuditLog{ID: id.New(), Action: action, EntityType: entity, EntityID: entityID}
	if actor := GetUserFromContext(ctx); actor != nil {
		entry.ActorID = &actor.ID
	}
	return tx.Create(&entry).Error
}
