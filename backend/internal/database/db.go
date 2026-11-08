package database

import (
	"fmt"
	"log/slog"
	"net/url"
	"strings"
	"time"

	"bmsolar-backend/internal/common/id"
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
	if err := db.AutoMigrate(
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
	); err != nil {
		return err
	}
	return MigrateBranchInformation(db)
}

// MigrateBranchInformation guarantees standard nationwide branches and matching channels
func MigrateBranchInformation(db *gorm.DB) error {
	type stdBranch struct {
		code      string
		slug      string
		name      string
		isHQ      bool
		province  string
		address   string
		phone     string
		email     string
		zalo      string
		hoursJSON string
		mapEmbed  string
		order     int
	}

	stdBranches := []stdBranch{
		{
			code:      "HCM-GV",
			slug:      "go-vap",
			name:      "Trụ Sở Chính — Gò Vấp, TP.HCM",
			isHQ:      true,
			province:  "TP. Hồ Chí Minh",
			address:   "568 Quang Trung, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh",
			phone:     "0901 234 567",
			email:     "govap@bmsolar.vn",
			zalo:      "0901234567",
			hoursJSON: `{"T2 - T7":"07:30 - 18:00","Chủ Nhật":"Trực hotline 24/7"}`,
			mapEmbed:  "https://maps.google.com/maps?q=568+Quang+Trung+Phuong+11+Go+Vap+Ho+Chi+Minh&output=embed",
			order:     1,
		},
		{
			code:      "BDI-QN",
			slug:      "quy-nhon",
			name:      "Chi Nhánh Miền Trung — TP. Quy Nhơn",
			isHQ:      false,
			province:  "Bình Định",
			address:   "01 Lê Duẩn, Phường Lý Thường Kiệt, TP. Quy Nhơn, Tỉnh Bình Định",
			phone:     "0909 876 543",
			email:     "quynhon@bmsolar.vn",
			zalo:      "0909876543",
			hoursJSON: `{"T2 - T7":"07:30 - 17:30","Chủ Nhật":"Nghỉ"}`,
			mapEmbed:  "https://maps.google.com/maps?q=01+Le+Duan+Ly+Thuong+Kiet+Quy+Nhon+Binh+Dinh&output=embed",
			order:     2,
		},
		{
			code:      "DNG-HC",
			slug:      "da-nang",
			name:      "Chi Nhánh Đà Nẵng — Hải Châu",
			isHQ:      false,
			province:  "Đà Nẵng",
			address:   "120 Nguyễn Hữu Thọ, Phường Hòa Thuận Tây, Quận Hải Châu, TP. Đà Nẵng",
			phone:     "0911 234 567",
			email:     "danang@bmsolar.vn",
			zalo:      "0911234567",
			hoursJSON: `{"T2 - T7":"07:30 - 17:30","Chủ Nhật":"Nghỉ"}`,
			mapEmbed:  "https://maps.google.com/maps?q=120+Nguyen+Huu+Tho+Hai+Chau+Da+Nang&output=embed",
			order:     3,
		},
		{
			code:      "HAN-DD",
			slug:      "ha-noi",
			name:      "Văn Phòng Đại Diện — TP. Hà Nội",
			isHQ:      false,
			province:  "Hà Nội",
			address:   "Số 88 Phố Vọng, Phường Phương Mai, Quận Đống Đa, TP. Hà Nội",
			phone:     "0988 777 666",
			email:     "hanoi@bmsolar.vn",
			zalo:      "0988777666",
			hoursJSON: `{"T2 - T6":"08:00 - 17:30","T7 - CN":"Nghỉ"}`,
			mapEmbed:  "https://maps.google.com/maps?q=88+Pho+Vong+Dong+Da+Ha+Noi&output=embed",
			order:     4,
		},
	}

	for _, sb := range stdBranches {
		var existing models.Branch
		if err := db.Where("code = ?", sb.code).First(&existing).Error; err != nil {
			newB := models.Branch{
				ID:             id.New(),
				Code:           sb.code,
				Slug:           sb.slug,
				Name:           sb.name,
				IsHeadquarters: sb.isHQ,
				ProvinceName:   sb.province,
				StreetAddress:  sb.address,
				Phone:          sb.phone,
				Email:          sb.email,
				Zalo:           sb.zalo,
				HoursJSON:      &sb.hoursJSON,
				MapEmbedURL:    sb.mapEmbed,
				IsActive:       true,
				SortOrder:      sb.order,
			}
			db.Create(&newB)
			existing = newB
		} else {
			existing.Name = sb.name
			existing.IsHeadquarters = sb.isHQ
			existing.ProvinceName = sb.province
			existing.StreetAddress = sb.address
			existing.Phone = sb.phone
			existing.Email = sb.email
			existing.Zalo = sb.zalo
			existing.HoursJSON = &sb.hoursJSON
			existing.MapEmbedURL = sb.mapEmbed
			existing.SortOrder = sb.order
			existing.IsActive = true
			db.Save(&existing)
		}

		syncStdBranchChannels(db, existing)
	}

	return nil
}

func syncStdBranchChannels(db *gorm.DB, b models.Branch) {
	if b.Phone != "" {
		var phoneChan models.ContactChannel
		if err := db.Where("branch_id = ? AND type = 'phone'", b.ID).First(&phoneChan).Error; err != nil {
			db.Create(&models.ContactChannel{
				ID:        id.New(),
				BranchID:  &b.ID,
				Type:      "phone",
				Label:     "Hotline " + b.Name,
				Target:    b.Phone,
				SortOrder: 1,
				Enabled:   true,
			})
		} else {
			phoneChan.Target = b.Phone
			phoneChan.Enabled = true
			db.Save(&phoneChan)
		}
	}
	if b.Email != "" {
		var emailChan models.ContactChannel
		if err := db.Where("branch_id = ? AND type = 'email'", b.ID).First(&emailChan).Error; err != nil {
			db.Create(&models.ContactChannel{
				ID:        id.New(),
				BranchID:  &b.ID,
				Type:      "email",
				Label:     "Email " + b.Name,
				Target:    b.Email,
				SortOrder: 2,
				Enabled:   true,
			})
		} else {
			emailChan.Target = b.Email
			emailChan.Enabled = true
			db.Save(&emailChan)
		}
	}
	if b.Zalo != "" {
		var zaloChan models.ContactChannel
		if err := db.Where("branch_id = ? AND type = 'zalo'", b.ID).First(&zaloChan).Error; err != nil {
			db.Create(&models.ContactChannel{
				ID:        id.New(),
				BranchID:  &b.ID,
				Type:      "zalo",
				Label:     "Zalo " + b.Name,
				Target:    b.Zalo,
				SortOrder: 3,
				Enabled:   true,
			})
		} else {
			zaloChan.Target = b.Zalo
			zaloChan.Enabled = true
			db.Save(&zaloChan)
		}
	}
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
