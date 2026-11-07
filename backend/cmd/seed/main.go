package main

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"time"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/identity"
)

func strPtr(s string) *string {
	return &s
}

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	logger.Info("seeding_database_start", slog.String("env", cfg.Env))

	db, err := database.Connect(cfg, logger)
	if err != nil {
		logger.Error("seeder_failed_to_connect_db", slog.Any("error", err))
		os.Exit(1)
	}

	// 1. Roles & Permissions
	permissionsList := []struct {
		Code        string
		Module      string
		Description string
	}{
		{"*", "system", "Toàn quyền hệ thống Super Admin"},
		{"cms.page.read", "cms", "Quyền xem các trang nội dung"},
		{"cms.page.create", "cms", "Quyền tạo trang mới"},
		{"cms.page.update", "cms", "Quyền sửa trang nội dung"},
		{"cms.page.publish", "cms", "Quyền xuất bản trang"},
		{"catalog.product.*", "catalog", "Toàn quyền quản trị danh mục sản phẩm"},
		{"catalog.product.read", "catalog", "Quyền xem danh mục sản phẩm"},
		{"projects.*", "projects", "Toàn quyền quản trị dự án tiêu biểu"},
		{"editorial.*", "editorial", "Toàn quyền quản trị bài viết"},
		{"crm.lead.read", "crm", "Quyền xem danh sách khách hàng"},
		{"crm.lead.assign", "crm", "Quyền phân công lead cho nhân viên"},
		{"crm.lead.transition", "crm", "Quyền cập nhật tiến độ tư vấn"},
		{"identity.user.manage", "identity", "Quyền quản trị tài khoản và phân quyền"},
		{"seo.metadata.manage", "seo", "Quyền quản lý từ khóa, chuyển hướng, sitemap"},
		{"branch.manage", "branch", "Quyền quản trị chi nhánh và hotline"},
	}

	permMap := make(map[string]models.Permission)
	for _, p := range permissionsList {
		var existing models.Permission
		if err := db.Where("code = ?", p.Code).First(&existing).Error; err != nil {
			perm := models.Permission{
				ID:          id.New(),
				Code:        p.Code,
				Module:      p.Module,
				Description: strPtr(p.Description),
				CreatedAt:   time.Now().UTC(),
				UpdatedAt:   time.Now().UTC(),
			}
			db.Create(&perm)
			permMap[p.Code] = perm
		} else {
			permMap[p.Code] = existing
		}
	}

	// Roles
	rolesList := []struct {
		Code        string
		Name        string
		Description string
		PermCodes   []string
	}{
		{"super_admin", "Super Administrator", "Toàn quyền quản trị tối cao", []string{"*"}},
		{"editor", "Biên tập viên", "Soạn thảo bài viết, sản phẩm, trang CMS", []string{"cms.page.read", "cms.page.create", "cms.page.update", "catalog.product.*", "projects.*", "editorial.*"}},
		{"publisher", "Người xuất bản", "Phê duyệt và xuất bản nội dung", []string{"cms.page.read", "cms.page.create", "cms.page.update", "cms.page.publish", "catalog.product.*", "projects.*", "editorial.*", "seo.metadata.manage"}},
		{"sales_agent", "Chuyên viên tư vấn", "Tiếp nhận và tư vấn khách hàng", []string{"crm.lead.read", "crm.lead.transition", "catalog.product.read"}},
		{"branch_manager", "Trưởng chi nhánh", "Quản lý chi nhánh và đội ngũ kinh doanh", []string{"crm.lead.read", "crm.lead.assign", "crm.lead.transition", "branch.manage"}},
		{"seo_manager", "Quản trị SEO", "Quản trị thẻ meta, sitemap, duyệt SEO draft", []string{"seo.metadata.manage", "editorial.*"}},
	}

	roleMap := make(map[string]models.Role)
	for _, r := range rolesList {
		var role models.Role
		if err := db.Where("code = ?", r.Code).First(&role).Error; err != nil {
			role = models.Role{
				ID:          id.New(),
				Code:        r.Code,
				Name:        r.Name,
				Description: strPtr(r.Description),
				CreatedAt:   time.Now().UTC(),
				UpdatedAt:   time.Now().UTC(),
			}
			db.Create(&role)

			// Attach permissions
			for _, pCode := range r.PermCodes {
				if perm, ok := permMap[pCode]; ok {
					_ = db.Exec("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", role.ID, perm.ID)
				}
			}
		}
		roleMap[r.Code] = role
	}

	// 2. Super Admin User
	adminEmail := "admin@bmsolar.vn"
	var existingAdmin models.User
	if err := db.Where("email = ?", adminEmail).First(&existingAdmin).Error; err != nil {
		pwdHash, _ := identity.HashPassword("Bmsolar@2026!")
		adminUser := models.User{
			ID:           id.New(),
			Email:        adminEmail,
			PasswordHash: pwdHash,
			DisplayName:  "BM SOLAR Super Admin",
			Status:       "active",
			CreatedAt:    time.Now().UTC(),
			UpdatedAt:    time.Now().UTC(),
		}
		db.Create(&adminUser)

		if superRole, ok := roleMap["super_admin"]; ok {
			_ = db.Exec("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", adminUser.ID, superRole.ID)
		}
		logger.Info("admin_user_created", slog.String("email", adminEmail))
	}

	// 3. Branches & Contact Channels
	branchesData := []struct {
		Code          string
		Slug          string
		Name          string
		StreetAddress string
		Hours         string
		Phone         string
		Zalo          string
		Email         string
	}{
		{
			Code:          "quy-nhon",
			Slug:          "quy-nhon",
			Name:          "BM SOLAR - Trụ sở & Chi nhánh Quy Nhơn",
			StreetAddress: "456 An Dương Vương, TP. Quy Nhơn, Tỉnh Bình Định",
			Hours:         `{"mon_fri":"07:30 - 17:30","sat":"08:00 - 12:00","sun":"Nghỉ"}`,
			Phone:         "+84907654321",
			Zalo:          "https://zalo.me/0907654321",
			Email:         "quynhon@bmsolar.vn",
		},
		{
			Code:          "go-vap",
			Slug:          "go-vap",
			Name:          "BM SOLAR - Chi nhánh Gò Vấp, TP.HCM",
			StreetAddress: "123 Quang Trung, Phường 10, Quận Gò Vấp, TP. Hồ Chí Minh",
			Hours:         `{"mon_fri":"08:00 - 17:30","sat":"08:00 - 12:00","sun":"Nghỉ"}`,
			Phone:         "+84901234567",
			Zalo:          "https://zalo.me/0901234567",
			Email:         "govap@bmsolar.vn",
		},
	}

	var defaultBranchID *string
	for _, b := range branchesData {
		var branch models.Branch
		if err := db.Where("code = ?", b.Code).First(&branch).Error; err != nil {
			branchID := id.New()
			branch = models.Branch{
				ID:            branchID,
				Code:          b.Code,
				Slug:          b.Slug,
				Name:          b.Name,
				StreetAddress: b.StreetAddress,
				HoursJSON:     strPtr(b.Hours),
				IsActive:      true,
				CreatedAt:     time.Now().UTC(),
				UpdatedAt:     time.Now().UTC(),
			}
			db.Create(&branch)

			channels := []models.ContactChannel{
				{ID: id.New(), BranchID: &branchID, Type: "phone", Label: "Hotline " + b.Name, Target: b.Phone, SortOrder: 1, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
				{ID: id.New(), BranchID: &branchID, Type: "zalo", Label: "Tư vấn Zalo " + b.Name, Target: b.Zalo, SortOrder: 2, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
				{ID: id.New(), BranchID: &branchID, Type: "email", Label: "Email liên hệ", Target: b.Email, SortOrder: 3, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
			}
			for _, ch := range channels {
				db.Create(&ch)
			}

			if defaultBranchID == nil {
				bid := branch.ID
				defaultBranchID = &bid
			}
		} else {
			if defaultBranchID == nil {
				bid := branch.ID
				defaultBranchID = &bid
			}
		}
	}

	// Global Contact Channels
	globalChannels := []models.ContactChannel{
		{ID: id.New(), BranchID: nil, Type: "phone", Label: "Tổng đài toàn quốc", Target: "+841900123456", SortOrder: 1, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
		{ID: id.New(), BranchID: nil, Type: "zalo", Label: "Zalo Official Account", Target: "https://zalo.me/bmsolar", SortOrder: 2, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
		{ID: id.New(), BranchID: nil, Type: "email", Label: "Email CSKH", Target: "contact@bmsolar.vn", SortOrder: 3, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
		{ID: id.New(), BranchID: nil, Type: "facebook", Label: "Fanpage Facebook", Target: "https://facebook.com/bmsolar.vietnam", SortOrder: 4, Enabled: true, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
	}
	for _, gc := range globalChannels {
		var existing models.ContactChannel
		if err := db.Where("branch_id IS NULL AND type = ?", gc.Type).First(&existing).Error; err != nil {
			db.Create(&gc)
		}
	}

	// 4. Site Settings & Theme Settings
	var siteSetting models.SiteSetting
	if err := db.First(&siteSetting).Error; err != nil {
		siteSetting = models.SiteSetting{
			ID:                  id.New(),
			SiteName:            "BM SOLAR — Giải Pháp Năng Lượng Mặt Trời Toàn Diện",
			DefaultLocale:       "vi-VN",
			DefaultBranchID:     defaultBranchID,
			SettingsRevision:    1,
			UtilityBarJSON:      `{"visible":true,"showHotline":true,"showEmail":true,"announcement":"BM SOLAR - Đơn vị lắp đặt điện mặt trời trọn gói hàng đầu miền Trung & Nam"}`,
			FooterConfigJSON:    `{"companyName":"CÔNG TY CỔ PHẦN ĐẦU TƯ & NĂNG LƯỢNG BM SOLAR","taxCode":"0316899999","address":"Trụ sở: 456 An Dương Vương, TP. Quy Nhơn, Bình Định | CN Gò Vấp: 123 Quang Trung, P.10, Gò Vấp, TP.HCM","hotline":"1900 123 456 - 0907 654 321","email":"contact@bmsolar.vn","legalText":"© 2026 BM SOLAR. Giấy phép kinh doanh năng lượng sạch số 0316899999. Tất cả quyền được bảo lưu."}`,
			MobileActionBarJSON: `[{"key":"home","label":"Trang chủ","icon":"home","target":{"kind":"internalRoute","routeKey":"home"}},{"key":"products","label":"Sản phẩm","icon":"cube","target":{"kind":"internalRoute","routeKey":"products"}},{"key":"call","label":"Gọi ngay","icon":"phone","target":{"kind":"contactChannel","channelType":"phone"}},{"key":"zalo","label":"Zalo","icon":"chat","target":{"kind":"contactChannel","channelType":"zalo"}},{"key":"menu","label":"Menu","icon":"menu","target":{"kind":"internalRoute","routeKey":"menu"}}]`,
			CreatedAt:           time.Now().UTC(),
			UpdatedAt:           time.Now().UTC(),
		}
		db.Create(&siteSetting)
	}

	var themeSetting models.ThemeSetting
	if err := db.First(&themeSetting).Error; err != nil {
		themeSetting = models.ThemeSetting{
			ID:          id.New(),
			SiteID:      "default",
			PrimaryHex:  "#0D4EA6",
			NavyHex:     "#0D2E63",
			AccentHex:   "#FF6B19",
			FontsToken:  "inter",
			RadiusToken: "md",
			CreatedAt:   time.Now().UTC(),
			UpdatedAt:   time.Now().UTC(),
		}
		db.Create(&themeSetting)
	}

	// 5. Navigation Menu & Items
	var navMenu models.NavigationMenu
	if err := db.Where("menu_key = ?", "header_main").First(&navMenu).Error; err != nil {
		menuID := id.New()
		navMenu = models.NavigationMenu{
			ID:        menuID,
			MenuKey:   "header_main",
			Locale:    "vi-VN",
			Status:    "published",
			CreatedAt: time.Now().UTC(),
			UpdatedAt: time.Now().UTC(),
		}
		db.Create(&navMenu)

		menuItems := []struct {
			Label      string
			TargetKind string
			TargetRef  string
			SortOrder  int
		}{
			{"Trang chủ", "internalRoute", "home", 1},
			{"Giới thiệu", "internalRoute", "about", 2},
			{"Giải pháp", "internalRoute", "solutions", 3},
			{"Sản phẩm", "internalRoute", "products", 4},
			{"Dự án", "internalRoute", "projects", 5},
			{"Tin tức", "internalRoute", "articles", 6},
			{"Liên hệ", "internalRoute", "contact", 7},
		}

		for _, item := range menuItems {
			ref := item.TargetRef
			navItem := models.NavigationItem{
				ID:         id.New(),
				MenuID:     menuID,
				Label:      item.Label,
				TargetKind: item.TargetKind,
				TargetRef:  &ref,
				SortOrder:  item.SortOrder,
				Visibility: "all",
				CreatedAt:  time.Now().UTC(),
				UpdatedAt:  time.Now().UTC(),
			}
			db.Create(&navItem)
		}
	}

	// 6. Audiences
	audiences := []struct {
		Code  string
		Label string
	}{
		{"household", "Hộ gia đình"},
		{"business", "Doanh nghiệp & Tòa nhà"},
		{"industrial", "Nhà máy & Khu công nghiệp"},
	}
	for _, a := range audiences {
		var aud models.Audience
		if err := db.Where("code = ?", a.Code).First(&aud).Error; err != nil {
			aud = models.Audience{
				ID:        id.New(),
				Code:      a.Code,
				Label:     a.Label,
				Enabled:   true,
				CreatedAt: time.Now().UTC(),
				UpdatedAt: time.Now().UTC(),
			}
			db.Create(&aud)
		}
	}

	// 7. Product Categories
	categories := []struct {
		Slug        string
		Name        string
		Description string
		SortOrder   int
	}{
		{"inverter-hoa-luoi", "Biến tần Inverter Hòa Lưới & Hybrid", "Thiết bị biến đổi điện DC/AC thông minh công nghệ hàng đầu thế giới", 1},
		{"tam-pin-quang-dien", "Tấm Pin Năng Lượng Mặt Trời", "Tấm pin Mono half-cell hiệu suất cao tiêu chuẩn Tier 1 bảo hành 25 năm", 2},
		{"pin-luu-tru-lithium", "Pin Lưu Trữ Lithium (ESS)", "Hệ thống pin lưu trữ điện thông minh, tuổi thọ trên 6000 chu kỳ nạp xả", 3},
		{"phu-kien-lap-dat", "Phụ Kiện & Thiết Bị Điện Chuyên Dụng", "Khung nhôm anodize, cáp điện DC solar chống cháy và tủ điện bảo vệ IP65", 4},
	}
	catMap := make(map[string]models.ProductCategory)
	for _, c := range categories {
		var cat models.ProductCategory
		if err := db.Where("slug = ?", c.Slug).First(&cat).Error; err != nil {
			cat = models.ProductCategory{
				ID:          id.New(),
				Slug:        c.Slug,
				Name:        c.Name,
				Description: strPtr(c.Description),
				SortOrder:   c.SortOrder,
				Status:      "published",
				Locale:      "vi-VN",
				CreatedAt:   time.Now().UTC(),
				UpdatedAt:   time.Now().UTC(),
			}
			db.Create(&cat)
		}
		catMap[c.Slug] = cat
	}

	// 8. Brands
	brands := []struct {
		Slug        string
		Name        string
		Description string
	}{
		{"deye", "Deye Solar", "Thương hiệu biến tần Hybrid và pin lưu trữ Lithium hàng đầu thế giới"},
		{"huawei", "Huawei FusionSolar", "Giải pháp quang điện thông minh công nghệ trí tuệ nhân tạo số 1 toàn cầu"},
		{"jinko", "Jinko Solar", "Nhà sản xuất tấm pin quang điện Tier 1 với sản lượng lớn nhất thế giới"},
		{"growatt", "Growatt", "Thương hiệu inverter dân dụng được ưa chuộng hàng đầu Việt Nam"},
	}
	brandMap := make(map[string]models.Brand)
	for _, br := range brands {
		var brand models.Brand
		if err := db.Where("slug = ?", br.Slug).First(&brand).Error; err != nil {
			brand = models.Brand{
				ID:          id.New(),
				Slug:        br.Slug,
				Name:        br.Name,
				Description: strPtr(br.Description),
				CreatedAt:   time.Now().UTC(),
				UpdatedAt:   time.Now().UTC(),
			}
			db.Create(&brand)
		}
		brandMap[br.Slug] = brand
	}

	// 9. Products
	products := []struct {
		SKU         string
		Slug        string
		Name        string
		CategoryKey string
		BrandKey    string
		Summary     string
		Specs       string
	}{
		{
			SKU:         "INV-DEYE-SUN-5K",
			Slug:        "inverter-deye-hybrid-5kw-sun-5k-sg03lp1-eu",
			Name:        "Inverter Deye Hybrid 5kW 1 Pha SUN-5K-SG03LP1-EU",
			CategoryKey: "inverter-hoa-luoi",
			BrandKey:    "deye",
			Summary:     "Biến tần Hybrid 5kW 1 pha Deye, hỗ trợ lưu trữ 48V, chuẩn IP65, hiệu suất 97.6%, bảo hành 5 năm chính hãng.",
			Specs:       `{"Công suất AC": "5000W", "Điện áp danh định": "230V 1 Pha", "Số MPPT": "2", "Điện áp pin lưu trữ": "48V / 51.2V", "Hiệu suất tối đa": "97.6%", "Cấp bảo vệ": "IP65", "Kết nối": "Wi-Fi, RS485, CAN"}`,
		},
		{
			SKU:         "PAN-JINKO-TIGER-550W",
			Slug:        "tam-pin-jinko-tiger-pro-550w-mono-half-cell",
			Name:        "Tấm pin Jinko Tiger Pro 550W Mono Half-Cell",
			CategoryKey: "tam-pin-quang-dien",
			BrandKey:    "jinko",
			Summary:     "Tấm pin quang điện Mono Tier 1 công suất 550W, công nghệ 9BB Half-Cell, hiệu suất quang năng 21.29%, bảo hành vật lý 12 năm, hiệu suất 25 năm.",
			Specs:       `{"Công suất cực đại (Pmax)": "550W", "Điện áp danh định (Vmp)": "40.90V", "Dòng điện danh định (Imp)": "13.45A", "Hiệu suất tấm pin": "21.29%", "Kích thước": "2278 x 1134 x 35 mm", "Trọng lượng": "28.0 kg"}`,
		},
		{
			SKU:         "BAT-DEYE-RW-M6.1",
			Slug:        "pin-luu-tru-deye-lithium-rw-m6-1-5-12kwh",
			Name:        "Pin Lưu Trữ Deye Lithium LiFePO4 5.12kWh RW-M6.1",
			CategoryKey: "pin-luu-tru-lithium",
			BrandKey:    "deye",
			Summary:     "Module pin lưu trữ Lithium sắt phosphate (LiFePO4) an toàn tuyệt đối, dung lượng 5.12kWh, tuổi thọ trên 6000 chu kỳ nạp xả, ghép song song tối đa 32 bộ.",
			Specs:       `{"Dung lượng danh định": "5.12kWh", "Điện áp danh định": "51.2V", "Dung lượng cell": "100Ah", "Tuổi thọ chu kỳ": ">= 6000 chu kỳ (90% DoD)", "Cấp bảo vệ": "IP65", "Trọng lượng": "55 kg"}`,
		},
	}

	for _, p := range products {
		var prod models.Product
		if err := db.Where("sku = ?", p.SKU).First(&prod).Error; err != nil {
			cat := catMap[p.CategoryKey]
			brand := brandMap[p.BrandKey]
			now := time.Now().UTC()
			prod = models.Product{
				ID:                id.New(),
				SKU:               p.SKU,
				Slug:              p.Slug,
				Name:              p.Name,
				CategoryID:        cat.ID,
				BrandID:           &brand.ID,
				Summary:           p.Summary,
				Description:       fmt.Sprintf("<p>%s</p><p>Sản phẩm phân phối chính hãng bởi BM SOLAR, đầy đủ chứng chỉ CO/CQ và được bảo hành chính hãng toàn quốc.</p>", p.Summary),
				Status:            "published",
				SpecificationJSON: strPtr(p.Specs),
				PublishedAt:       &now,
				CreatedAt:         now,
				UpdatedAt:         now,
			}
			db.Create(&prod)
		}
	}

	// 10. Project Types & Provinces & Projects
	var projType models.ProjectType
	if err := db.Where("slug = ?", "dien-mat-troi-ap-mai-gia-dinh").First(&projType).Error; err != nil {
		projType = models.ProjectType{
			ID:        id.New(),
			Slug:      "dien-mat-troi-ap-mai-gia-dinh",
			Name:      "Điện Mặt Trời Áp Mái Gia Đình",
			CreatedAt: time.Now().UTC(),
		}
		db.Create(&projType)
	}

	var provinceBD models.Province
	if err := db.Where("code = ?", "binh-dinh").First(&provinceBD).Error; err != nil {
		provinceBD = models.Province{
			ID:   id.New(),
			Code: "binh-dinh",
			Name: "Tỉnh Bình Định",
		}
		db.Create(&provinceBD)
	}

	var project1 models.Project
	if err := db.Where("slug = ?", "du-an-ap-mai-biet-thu-quy-nhon-15kw").First(&project1).Error; err != nil {
		now := time.Now().UTC()
		body := `{"location":"Khu đô thị sinh thái Quy Nhơn, Bình Định","gridConnectionDate":"2026-03","panels":"30 tấm Jinko 550W","inverter":"Deye 15kW Hybrid 3 Pha","battery":"3 bộ Deye Lithium 5.12kWh"}`
		project1 = models.Project{
			ID:            id.New(),
			Slug:          "du-an-ap-mai-biet-thu-quy-nhon-15kw",
			Title:         "Dự Án Áp Mái Biệt Thự Đảo Quy Nhơn 15kWp Hệ Hybrid",
			ProjectTypeID: projType.ID,
			ProvinceID:    provinceBD.ID,
			Summary:       "Hệ thống điện mặt trời hòa lưới có lưu trữ 15kWp sử dụng biến tần Deye 3 pha và 30 tấm pin Jinko 550W, cắt giảm 85% hóa đơn tiền điện hàng tháng.",
			BodyJSON:      strPtr(body),
			Status:        "published",
			PublishedAt:   &now,
			CreatedAt:     now,
			UpdatedAt:     now,
		}
		db.Create(&project1)
	}

	// 11. Articles
	var article models.Article
	if err := db.Where("slug = ?", "cam-nang-chon-bien-tan-inverter-hybrid-2026").First(&article).Error; err != nil {
		now := time.Now().UTC()
		article = models.Article{
			ID:          id.New(),
			Slug:        "cam-nang-chon-bien-tan-inverter-hybrid-2026",
			Title:       "Cẩm Nang Chọn Biến Tần Inverter Hybrid Cho Gia Đình 2026",
			Excerpt:     "Tại sao hệ thống điện mặt trời Hybrid có lưu trữ đang là xu hướng được quan tâm hàng đầu năm 2026? Cùng chuyên gia BM SOLAR phân tích chi tiết.",
			BodyJSON:    `{"sections":[{"title":"1. Inverter Hybrid là gì?","content":"Inverter Hybrid là dòng biến tần kết hợp giữa khả năng hòa lưới và sạc xả vào hệ thống pin lưu trữ lithium."},{"title":"2. Lợi ích vượt trội","content":"Đảm bảo gia đình luôn có điện sử dụng kể cả khi cúp điện lưới, tối ưu hóa tiền điện giờ cao điểm."}]}`,
			Status:      "published",
			PublishedAt: &now,
			CreatedAt:   now,
			UpdatedAt:   now,
		}
		db.Create(&article)
	}

	// 12. Complete Home Page with Typed Blocks matching UI Reference
	var homePage models.Page
	if err := db.Where("page_key = ?", "home").First(&homePage).Error; err != nil {
		pageID := id.New()
		revID := id.New()
		now := time.Now().UTC()

		blocks := []cms.Block{
			{
				ID:         id.New(),
				Type:       "heroCarousel",
				Version:    1,
				Enabled:    true,
				SortOrder:  1,
				Visibility: "all",
				Data: json.RawMessage(`{
					"slides": [
						{
							"title": "TIÊN PHONG NĂNG LƯỢNG SẠCH CHO MỌI NGÔI NHÀ & DOANH NGHIỆP",
							"subtitle": "Giải pháp điện mặt trời hòa lưới & lưu trữ cao cấp, bảo hành 25 năm chính hãng cùng BM SOLAR.",
							"desktopMediaId": "media_hero_desktop_01",
							"mobileMediaId": "media_hero_mobile_01",
							"desktopMediaUrl": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1920&q=80",
							"mobileMediaUrl": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80",
							"overlayOpacity": 0.45,
							"cta": {
								"label": "Nhận Báo Giá Ngay",
								"target": {"kind": "leadForm", "formKey": "consultation"}
							}
						}
					]
				}`),
			},
			{
				ID:         id.New(),
				Type:       "featureHighlights",
				Version:    1,
				Enabled:    true,
				SortOrder:  2,
				Visibility: "all",
				Data: json.RawMessage(`{
					"items": [
						{"iconToken": "sparkles", "label": "Tiết kiệm 90% Điện", "description": "Tối ưu hóa hóa đơn điện lũy tiến hàng tháng"},
						{"iconToken": "shield-check", "label": "Bảo Hành 25 Năm", "description": "Tấm pin và biến tần chính hãng chuẩn Tier 1"},
						{"iconToken": "device-mobile", "label": "Giám Sát Thông Minh 24/7", "description": "Ứng dụng theo dõi sản lượng điện trực tuyến"},
						{"iconToken": "user-group", "label": "Kỹ Sư Chuyên Nghiệp", "description": "Đội ngũ kỹ thuật thi công nhanh trong 48h"}
					]
				}`),
			},
			{
				ID:         id.New(),
				Type:       "categoryShowcase",
				Version:    1,
				Enabled:    true,
				SortOrder:  3,
				Visibility: "all",
				Data: json.RawMessage(`{
					"categoryIds": ["inverter-hoa-luoi", "tam-pin-quang-dien", "pin-luu-tru-lithium"],
					"displayMode": "grid"
				}`),
			},
			{
				ID:         id.New(),
				Type:       "audienceShowcase",
				Version:    1,
				Enabled:    true,
				SortOrder:  4,
				Visibility: "all",
				Data: json.RawMessage(`{
					"audienceCodes": ["household", "business", "industrial"]
				}`),
			},
			{
				ID:         id.New(),
				Type:       "contactPanel",
				Version:    1,
				Enabled:    true,
				SortOrder:  5,
				Visibility: "all",
				Data: json.RawMessage(`{
					"heading": "ĐĂNG KÝ KHẢO SÁT & NHẬN BÁO GIÁ MIỄN PHÍ",
					"subheading": "Kỹ sư BM SOLAR sẽ liên hệ tư vấn giải pháp tối ưu chi phí trong vòng 15 phút.",
					"showBranches": true
				}`),
			},
		}

		blocksJSON, _ := json.Marshal(blocks)
		seoJSON := `{"metaTitle":"BM SOLAR — Giải Pháp Điện Mặt Trời Hòa Lưới & Lưu Trữ Uy Tín","metaDescription":"BM SOLAR cung cấp thiết bị và lắp đặt trọn gói điện mặt trời mái nhà cho hộ gia đình, doanh nghiệp tại Quy Nhơn, Bình Định và TP.HCM. Bảo hành 25 năm.","robots":"index, follow","canonicalUrl":"https://bmsolar.vn/"}`

		revision := models.PageRevision{
			ID:         revID,
			PageID:     pageID,
			RevisionNo: 1,
			BlocksJSON: string(blocksJSON),
			SeoJSON:    strPtr(seoJSON),
			CreatedBy:  strPtr("system_seed"),
			CreatedAt:  now,
		}
		db.Create(&revision)

		homePage = models.Page{
			ID:                     pageID,
			PageKey:                "home",
			RouteSlug:              "/",
			Title:                  "Trang Chủ BM SOLAR",
			Locale:                 "vi-VN",
			CurrentDraftRevisionID: &revID,
			PublishedRevisionID:    &revID,
			PublicationState:       "published",
			CreatedAt:              now,
			UpdatedAt:              now,
		}
		db.Create(&homePage)
		logger.Info("homepage_seeded_with_blocks", slog.String("pageKey", "home"))
	}

	logger.Info("seeding_database_completed_successfully")
}
