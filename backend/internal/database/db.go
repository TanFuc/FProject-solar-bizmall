package database

import (
	"fmt"
	"log/slog"
	"net/url"
	"strings"
	"time"

	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect initializes the database connection based on config
func Connect(cfg *config.Config, log *slog.Logger) (*gorm.DB, error) {
	var dialector gorm.Dialector

	if cfg.DBDriver == "mysql" {
		dsn := formatMySQLDSN(cfg.DatabaseURL)
		dialector = mysql.Open(dsn)
	} else {
		// SQLite (pure Go, CGO-free via modernc.org/sqlite)
		dbPath := cfg.DatabaseURL
		if strings.HasPrefix(dbPath, "sqlite://") {
			dbPath = strings.TrimPrefix(dbPath, "sqlite://")
		}
		dialector = sqlite.Open(dbPath)
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	db, err := gorm.Open(dialector, gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Run automigrations
	if err := AutoMigrate(db); err != nil {
		return nil, fmt.Errorf("failed to automigrate database: %w", err)
	}

	log.Info("database_connected",
		slog.String("driver", cfg.DBDriver),
	)

	return db, nil
}

// ConnectTestMemory creates an isolated in-memory SQLite database for testing
func ConnectTestMemory() (*gorm.DB, error) {
	dialector := sqlite.Open(":memory:?cache=shared")
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, err
	}

	if err := AutoMigrate(db); err != nil {
		return nil, err
	}

	return db, nil
}

// AutoMigrate migrates all schema models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.SiteSetting{},
		&models.ThemeSetting{},
		&models.Branch{},
		&models.ContactChannel{},
		&models.NavigationMenu{},
		&models.NavigationItem{},
		&models.Page{},
		&models.PageRevision{},
		&models.Audience{},
		&models.ProductCategory{},
		&models.Brand{},
		&models.Product{},
		&models.ProductMedia{},
		&models.ProductAudience{},
		&models.ProjectType{},
		&models.Province{},
		&models.Project{},
		&models.ProjectProduct{},
		&models.Article{},
		&models.Tag{},
		&models.ContentTag{},
		&models.MediaAsset{},
		&models.MediaVariant{},
		&models.SeoMetadata{},
		&models.SeoRedirect{},
		&models.SeoJob{},
		&models.SeoGenerationDraft{},
		&models.Lead{},
		&models.LeadActivity{},
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.RolePermission{},
		&models.UserRole{},
		&models.AuditLog{},
		&models.OutboxEvent{},
		&models.Solution{},
	)
}

func formatMySQLDSN(rawURL string) string {
	if strings.Contains(rawURL, "@tcp(") {
		return rawURL
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	user := u.User.Username()
	pass, _ := u.User.Password()
	host := u.Host
	if !strings.Contains(host, ":") {
		host += ":3306"
	}
	dbName := strings.TrimPrefix(u.Path, "/")
	return fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=UTC", user, pass, host, dbName)
}
