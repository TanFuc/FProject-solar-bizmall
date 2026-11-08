package seed

import (
	"encoding/json"
	"time"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/identity"

	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB, cfg *config.Config) error {
	now := time.Now().UTC()

	// 1. Permissions & Roles
	perms := []models.Permission{
		{ID: id.New(), Code: "identity.user.manage", Description: strPtr("Quản lý tài khoản và phân quyền"), Module: "identity"},
		{ID: id.New(), Code: "cms.page.read", Description: strPtr("Xem trang CMS"), Module: "cms"},
		{ID: id.New(), Code: "cms.page.create", Description: strPtr("Tạo trang CMS"), Module: "cms"},
		{ID: id.New(), Code: "cms.page.update", Description: strPtr("Chỉnh sửa trang CMS"), Module: "cms"},
		{ID: id.New(), Code: "cms.page.publish", Description: strPtr("Xuất bản trang CMS"), Module: "cms"},
		{ID: id.New(), Code: "catalog.product.*", Description: strPtr("Toàn quyền quản lý sản phẩm"), Module: "catalog"},
		{ID: id.New(), Code: "crm.lead.read", Description: strPtr("Xem danh sách và chi tiết lead"), Module: "crm"},
		{ID: id.New(), Code: "crm.lead.assign", Description: strPtr("Phân công xử lý lead"), Module: "crm"},
		{ID: id.New(), Code: "crm.lead.transition", Description: strPtr("Chuyển trạng thái lead"), Module: "crm"},
		{ID: id.New(), Code: "branch.manage", Description: strPtr("Quản lý chi nhánh"), Module: "branch"},
		{ID: id.New(), Code: "seo.metadata.manage", Description: strPtr("Quản lý SEO và redirect"), Module: "seo"},
	}
	for _, p := range perms {
		var existing models.Permission
		if db.Where("code = ?", p.Code).First(&existing).Error != nil {
			db.Create(&p)
		}
	}

	superRole := models.Role{ID: id.New(), Code: "super_admin", Name: "Super Admin", Description: strPtr("Toàn quyền hệ thống")}
	adminRole := models.Role{ID: id.New(), Code: "admin", Name: "Quản trị viên", Description: strPtr("Quản trị nội dung & CRM")}
	salesRole := models.Role{ID: id.New(), Code: "sales_agent", Name: "Nhân viên kinh doanh", Description: strPtr("Tiếp nhận và tư vấn lead")}

	roles := []models.Role{superRole, adminRole, salesRole}
	for _, r := range roles {
		var existing models.Role
		if db.Where("code = ?", r.Code).First(&existing).Error != nil {
			db.Create(&r)
		}
	}

	// Link permissions to admin & sales roles
	var dbAdminRole models.Role
	db.Where("code = 'admin'").First(&dbAdminRole)
	var allPerms []models.Permission
	db.Find(&allPerms)
	for _, p := range allPerms {
		db.FirstOrCreate(&models.RolePermission{RoleID: dbAdminRole.ID, PermissionID: p.ID})
	}

	var dbSalesRole models.Role
	db.Where("code = 'sales_agent'").First(&dbSalesRole)
	for _, p := range allPerms {
		if p.Module == "crm" {
			db.FirstOrCreate(&models.RolePermission{RoleID: dbSalesRole.ID, PermissionID: p.ID})
		}
	}

	// 2. Branches
	branchHCM := models.Branch{
		ID:            id.New(),
		Code:          "HCM-GV",
		Slug:          "go-vap",
		Name:          "Trụ sở chính Gò Vấp - TP.HCM",
		StreetAddress: "Số 123 Đường Quang Trung, Phường 10, Quận Gò Vấp, TP. Hồ Chí Minh",
		HoursJSON:     strPtr(`{"weekdays":"08:00 - 17:30","weekend":"08:00 - 12:00"}`),
		IsActive:      true,
		SortOrder:     1,
	}
	var existingBranchHCM models.Branch
	if db.Where("code = ?", branchHCM.Code).First(&existingBranchHCM).Error != nil {
		db.Create(&branchHCM)
	} else {
		branchHCM = existingBranchHCM
	}

	branchQN := models.Branch{
		ID:            id.New(),
		Code:          "BDI-QN",
		Slug:          "quy-nhon",
		Name:          "Chi nhánh Quy Nhơn - Bình Định",
		StreetAddress: "Số 456 Đường Nguyễn Tất Thành, TP. Quy Nhơn, Tỉnh Bình Định",
		HoursJSON:     strPtr(`{"weekdays":"08:00 - 17:00","weekend":"Nghỉ"}`),
		IsActive:      true,
		SortOrder:     2,
	}
	var existingBranchQN models.Branch
	if db.Where("code = ?", branchQN.Code).First(&existingBranchQN).Error != nil {
		db.Create(&branchQN)
	} else {
		branchQN = existingBranchQN
	}

	// Contact Channels per branch
	channels := []models.ContactChannel{
		{ID: id.New(), BranchID: &branchHCM.ID, Type: "phone", Label: "Hotline HCM", Target: "0901234567", SortOrder: 1, Enabled: true},
		{ID: id.New(), BranchID: &branchHCM.ID, Type: "zalo", Label: "Zalo Tư Vấn HCM", Target: "0901234567", SortOrder: 2, Enabled: true},
		{ID: id.New(), BranchID: &branchHCM.ID, Type: "email", Label: "Email HCM", Target: "govap@bmsolar.vn", SortOrder: 3, Enabled: true},
		{ID: id.New(), BranchID: &branchQN.ID, Type: "phone", Label: "Hotline Quy Nhơn", Target: "0909876543", SortOrder: 1, Enabled: true},
		{ID: id.New(), BranchID: &branchQN.ID, Type: "zalo", Label: "Zalo Quy Nhơn", Target: "0909876543", SortOrder: 2, Enabled: true},
		{ID: id.New(), BranchID: &branchQN.ID, Type: "email", Label: "Email Quy Nhơn", Target: "quynhon@bmsolar.vn", SortOrder: 3, Enabled: true},
		// Global
		{ID: id.New(), BranchID: nil, Type: "phone", Label: "Tổng đài toàn quốc", Target: "1900888666", SortOrder: 1, Enabled: true},
		{ID: id.New(), BranchID: nil, Type: "zalo", Label: "Chat Zalo tư vấn", Target: "0901234567", SortOrder: 2, Enabled: true},
		{ID: id.New(), BranchID: nil, Type: "facebook", Label: "Facebook Fanpage", Target: "https://facebook.com/bmsolar.vn", SortOrder: 3, Enabled: true},
		{ID: id.New(), BranchID: nil, Type: "youtube", Label: "YouTube Channel", Target: "https://youtube.com/@bmsolar", SortOrder: 4, Enabled: true},
		{ID: id.New(), BranchID: nil, Type: "email", Label: "Email hỗ trợ", Target: "info@bmsolar.vn", SortOrder: 5, Enabled: true},
	}
	for _, c := range channels {
		var cnt int64
		query := db.Model(&models.ContactChannel{}).Where("type = ? AND label = ?", c.Type, c.Label)
		if c.BranchID != nil {
			query = query.Where("branch_id = ?", *c.BranchID)
		} else {
			query = query.Where("branch_id IS NULL")
		}
		query.Count(&cnt)
		if cnt == 0 {
			db.Create(&c)
		}
	}

	// 3. Admin Users
	hash, _ := identity.HashPassword("Admin@123456")
	adminUser := models.User{
		ID:           id.New(),
		Email:        "admin@bmsolar.vn",
		PasswordHash: hash,
		DisplayName:  "BM SOLAR Administrator",
		Status:       "active",
	}
	var existingUser models.User
	if db.Where("email = ?", adminUser.Email).First(&existingUser).Error != nil {
		db.Create(&adminUser)
		db.Create(&models.UserRole{UserID: adminUser.ID, RoleID: dbAdminRole.ID})
	} else {
		adminUser = existingUser
	}

	salesHash, _ := identity.HashPassword("Sales@123456")
	salesHCM := models.User{
		ID:           id.New(),
		Email:        "sales.hcm@bmsolar.vn",
		PasswordHash: salesHash,
		DisplayName:  "Tư vấn viên HCM",
		BranchID:     &branchHCM.ID,
		Status:       "active",
	}
	if db.Where("email = ?", salesHCM.Email).First(&models.User{}).Error != nil {
		db.Create(&salesHCM)
		db.Create(&models.UserRole{UserID: salesHCM.ID, RoleID: dbSalesRole.ID})
	}

	// 4. Site Settings & Theme
	siteSettings := models.SiteSetting{
		ID:                  id.New(),
		DefaultBranchID:     &branchHCM.ID,
		SiteName:            "BM SOLAR — Giải Pháp Điện Mặt Trời Áp Mái",
		DefaultLocale:       "vi-VN",
		SettingsRevision:    1,
		UtilityBarJSON:      `{"visible":true,"showHotline":true,"showEmail":true}`,
		FooterConfigJSON:    `{"legalText":"© 2026 BM SOLAR. GPKD số 0312345678 do Sở KHĐT TP.HCM cấp. Tất cả quyền được bảo lưu.","groups":[{"title":"Về BM SOLAR","links":[{"label":"Giới thiệu","url":"/gioi-thieu"},{"label":"Hồ sơ năng lực","url":"/ho-so-nang-luc"},{"label":"Chứng nhận & Đối tác","url":"/doi-tac"}]},{"title":"Giải pháp","links":[{"label":"Điện mặt trời hộ gia đình","url":"/giai-phap/ho-gia-dinh"},{"label":"Điện mặt trời doanh nghiệp","url":"/giai-phap/doanh-nghiep"},{"label":"Điện mặt trời nhà xưởng","url":"/giai-phap/nha-xuong"}]},{"title":"Hỗ trợ khách hàng","links":[{"label":"Chính sách bảo hành","url":"/chinh-sach-bao-hanh"},{"label":"Quy trình lắp đặt","url":"/quy-trinh-lap-dat"},{"label":"Liên hệ báo giá","url":"/lien-he"}]}]}`,
		MobileActionBarJSON: `[{"key":"home","label":"Trang chủ","icon":"home","target":{"kind":"internalRoute","routeKey":"home"}},{"key":"products","label":"Sản phẩm","icon":"grid","target":{"kind":"internalRoute","routeKey":"products"}},{"key":"call","label":"Gọi ngay","icon":"phone","target":{"kind":"contactChannel","channelType":"phone"}},{"key":"zalo","label":"Zalo","icon":"message-circle","target":{"kind":"contactChannel","channelType":"zalo"}},{"key":"menu","label":"Menu","icon":"menu","target":{"kind":"internalRoute","routeKey":"menu"}}]`,
	}
	var existingSite models.SiteSetting
	if db.First(&existingSite).Error != nil {
		db.Create(&siteSettings)
	}

	theme := models.ThemeSetting{
		ID:          id.New(),
		SiteID:      "default",
		PrimaryHex:  "#0D4EA6",
		NavyHex:     "#0D2E63",
		AccentHex:   "#FF6B19",
		FontsToken:  "inter",
		RadiusToken: "md",
	}
	var existingTheme models.ThemeSetting
	if db.First(&existingTheme).Error != nil {
		db.Create(&theme)
	}

	// 5. Navigation Menu
	headerMenu := models.NavigationMenu{
		ID:      id.New(),
		MenuKey: "main_header",
		Locale:  "vi-VN",
		Status:  "published",
	}
	var existingHeaderMenu models.NavigationMenu
	if db.Where("menu_key = 'main_header'").First(&existingHeaderMenu).Error != nil {
		db.Create(&headerMenu)
	} else {
		headerMenu = existingHeaderMenu
		db.Where("menu_id = ?", headerMenu.ID).Delete(&models.NavigationItem{})
	}

	solMenuID := id.New()
	menuItems := []models.NavigationItem{
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Trang chủ", TargetKind: "internalRoute", TargetRef: strPtr("/"), SortOrder: 1, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Giới thiệu", TargetKind: "internalRoute", TargetRef: strPtr("/gioi-thieu"), SortOrder: 2, Visibility: "all"},
		{ID: solMenuID, MenuID: headerMenu.ID, Label: "Giải pháp", TargetKind: "internalRoute", TargetRef: strPtr("/giai-phap"), SortOrder: 3, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, ParentID: &solMenuID, Label: "Hộ gia đình", Description: strPtr("Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện"), TargetKind: "internalRoute", TargetRef: strPtr("/giai-phap/ho-gia-dinh"), SortOrder: 1, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, ParentID: &solMenuID, Label: "Doanh nghiệp & Thương mại", Description: strPtr("Giải pháp tối ưu chi phí vận hành cho văn phòng, khách sạn, cửa hàng"), TargetKind: "internalRoute", TargetRef: strPtr("/giai-phap/doanh-nghiep"), SortOrder: 2, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, ParentID: &solMenuID, Label: "Nhà xưởng & Công nghiệp", Description: strPtr("Quy mô công suất lớn 100kWp - 1MWp+, đạt chứng chỉ xanh ESG"), TargetKind: "internalRoute", TargetRef: strPtr("/giai-phap/nha-xuong-cong-nghiep"), SortOrder: 3, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Sản phẩm", TargetKind: "internalRoute", TargetRef: strPtr("/san-pham"), SortOrder: 4, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Dự án", TargetKind: "internalRoute", TargetRef: strPtr("/du-an"), SortOrder: 5, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Tin tức", TargetKind: "internalRoute", TargetRef: strPtr("/tin-tuc"), SortOrder: 6, Visibility: "all"},
		{ID: id.New(), MenuID: headerMenu.ID, Label: "Liên hệ", TargetKind: "internalRoute", TargetRef: strPtr("/lien-he"), SortOrder: 7, Visibility: "all"},
	}
	for _, mi := range menuItems {
		db.Create(&mi)
	}

	// 6. Audiences
	audiences := []models.Audience{
		{ID: id.New(), Code: "household", Label: "Hộ gia đình", Description: strPtr("Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện"), SortOrder: 1, Enabled: true},
		{ID: id.New(), Code: "business", Label: "Doanh nghiệp & Thương mại", Description: strPtr("Giải pháp tối ưu chi phí vận hành cho văn phòng, khách sạn, cửa hàng"), SortOrder: 2, Enabled: true},
		{ID: id.New(), Code: "industrial", Label: "Nhà xưởng & Công nghiệp", Description: strPtr("Quy mô công suất lớn 100kWp - 1MWp+, đạt chứng chỉ xanh ESG"), SortOrder: 3, Enabled: true},
	}
	for _, a := range audiences {
		if db.Where("code = ?", a.Code).First(&models.Audience{}).Error != nil {
			db.Create(&a)
		}
	}

	// 7. Categories & Brands
	cats := []models.ProductCategory{
		{ID: id.New(), Slug: "bien-tan-inverter", Name: "Biến tần Inverter", Description: strPtr("Inverter hòa lưới, hybrid và off-grid chính hãng"), SortOrder: 1, Status: "published"},
		{ID: id.New(), Slug: "tam-pin-nang-luong-mat-troi", Name: "Tấm pin năng lượng mặt trời", Description: strPtr("Tấm pin công nghệ Mono PERC, TopCon hiệu suất cao"), SortOrder: 2, Status: "published"},
		{ID: id.New(), Slug: "pin-luu-tru-lithium", Name: "Pin lưu trữ Lithium (ESS)", Description: strPtr("Hệ thống lưu trữ điện mặt trời an toàn, tuổi thọ trên 15 năm"), SortOrder: 3, Status: "published"},
		{ID: id.New(), Slug: "phu-kien-he-thong-khung", Name: "Phụ kiện & Khung giá đỡ", Description: strPtr("Khung nhôm anodized, cáp solar, tủ điện bảo vệ"), SortOrder: 4, Status: "published"},
	}
	for _, c := range cats {
		if db.Where("slug = ?", c.Slug).First(&models.ProductCategory{}).Error != nil {
			db.Create(&c)
		}
	}

	brands := []models.Brand{
		{ID: id.New(), Slug: "deye", Name: "Deye", Description: strPtr("Nhà sản xuất Inverter Hybrid và hệ thống lưu trữ hàng đầu thế giới")},
		{ID: id.New(), Slug: "longi", Name: "LONGi Solar", Description: strPtr("Thương hiệu tấm pin quang điện Tier 1 số 1 toàn cầu")},
		{ID: id.New(), Slug: "growatt", Name: "Growatt", Description: strPtr("Nhà cung cấp giải pháp điện mặt trời phân tán uy tín")},
		{ID: id.New(), Slug: "canadian-solar", Name: "Canadian Solar", Description: strPtr("Thương hiệu pin mặt trời quốc tế công nghệ vượt trội")},
	}
	for _, b := range brands {
		if db.Where("slug = ?", b.Slug).First(&models.Brand{}).Error != nil {
			db.Create(&b)
		}
	}

	var catInverter, catPanel, catStorage models.ProductCategory
	db.Where("slug = 'bien-tan-inverter'").First(&catInverter)
	db.Where("slug = 'tam-pin-nang-luong-mat-troi'").First(&catPanel)
	db.Where("slug = 'pin-luu-tru-lithium'").First(&catStorage)

	var brandDeye, brandLongi models.Brand
	db.Where("slug = 'deye'").First(&brandDeye)
	db.Where("slug = 'longi'").First(&brandLongi)

	var audHousehold, audBusiness, audIndustrial models.Audience
	db.Where("code = 'household'").First(&audHousehold)
	db.Where("code = 'business'").First(&audBusiness)
	db.Where("code = 'industrial'").First(&audIndustrial)

	// 8. Products
	prods := []models.Product{
		{
			ID:                id.New(),
			SKU:               "DEYE-SUN-5K-SG04LP1",
			Slug:              "inverter-hybrid-deye-5kw-1-pha",
			Name:              "Inverter Hybrid Deye 5kW 1 Pha (SUN-5K-SG04LP1-EU)",
			CategoryID:        catInverter.ID,
			BrandID:           &brandDeye.ID,
			Summary:           "Biến tần Hybrid Deye 5kW 1 pha tích hợp cổng kết nối máy phát điện và pin lưu trữ, hiệu suất 97.6%.",
			Description:       "Inverter Hybrid Deye 5kW 1 pha là giải pháp lý tưởng cho các hộ gia đình có nhu cầu sử dụng điện liên tục không lo mất điện lưới. Máy hỗ trợ lưu trữ acquy hoặc lithium 48V, chuyển mạch UPS dưới 4ms, màn hình cảm ứng LCD hiển thị trực quan và bảo hành chính hãng 5 năm.",
			SpecificationJSON: strPtr(`{"powerKW":5,"phase":1,"maxEfficiency":"97.6%","batteryVoltage":"40-60V","ipRating":"IP65","warrantyYears":5}`),
			Status:            "published",
			PublishedAt:       &now,
		},
		{
			ID:                id.New(),
			SKU:               "LONGI-HI-MO5-550W",
			Slug:              "tam-pin-longi-550w-mono-half-cell",
			Name:              "Tấm Pin Mặt Trời LONGi Hi-MO 5 550W Mono Half-cell",
			CategoryID:        catPanel.ID,
			BrandID:           &brandLongi.ID,
			Summary:           "Tấm pin Mono PERC hiệu suất cao 21.3%, khả năng chịu tải gió 2400Pa và tải tuyết 5400Pa.",
			Description:       "Dòng sản phẩm LONGi Hi-MO 5 ứng dụng công nghệ thanh dẫn gallium-doped wafer M10, giảm suy hao hiệu suất quang học và tối đa hóa sản lượng điện năng phát ra ngay cả trong điều kiện nắng yếu hoặc bóng râm.",
			SpecificationJSON: strPtr(`{"wattage":550,"efficiency":"21.3%","cellType":"Monocrystalline","dimensions":"2278x1134x35mm","warrantyProductYears":12,"warrantyPerformanceYears":25}`),
			Status:            "published",
			PublishedAt:       &now,
		},
		{
			ID:                id.New(),
			SKU:               "DEYE-SE-G5.1-PRO",
			Slug:              "pin-luu-tru-lithium-deye-5-12kwh",
			Name:              "Pin Lưu Trữ Lithium Deye 5.12kWh 51.2V 100Ah",
			CategoryID:        catStorage.ID,
			BrandID:           &brandDeye.ID,
			Summary:           "Pin lưu trữ LifePO4 an toàn chống cháy nổ, chu kỳ sạc xả trên 6000 lần, ghép nối tối đa 64 bộ song song.",
			Description:       "Bộ lưu trữ Deye SE-G5.1 Pro mang đến sự an tâm tuyệt đối với tế bào pin Lithium Iron Phosphate cao cấp, hệ thống quản trị pin thông minh BMS bảo vệ đa tầng và khả năng mở rộng dung lượng linh hoạt.",
			SpecificationJSON: strPtr(`{"capacityKWh":5.12,"nominalVoltage":"51.2V","capacityAh":100,"dod":"90%","cycleLife":6000,"warrantyYears":10}`),
			Status:            "published",
			PublishedAt:       &now,
		},
	}

	for _, p := range prods {
		if db.Where("sku = ?", p.SKU).First(&models.Product{}).Error != nil {
			db.Create(&p)
			db.Create(&models.ProductAudience{ProductID: p.ID, AudienceID: audHousehold.ID})
			if p.CategoryID == catPanel.ID {
				db.Create(&models.ProductAudience{ProductID: p.ID, AudienceID: audBusiness.ID})
				db.Create(&models.ProductAudience{ProductID: p.ID, AudienceID: audIndustrial.ID})
			}
		}
	}

	// 9. Provinces & Project Types
	provinces := []models.Province{
		{ID: id.New(), Code: "79", Name: "TP. Hồ Chí Minh"},
		{ID: id.New(), Code: "52", Name: "Tỉnh Bình Định"},
		{ID: id.New(), Code: "74", Name: "Tỉnh Bình Dương"},
		{ID: id.New(), Code: "80", Name: "Tỉnh Long An"},
	}
	for _, pv := range provinces {
		if db.Where("code = ?", pv.Code).First(&models.Province{}).Error != nil {
			db.Create(&pv)
		}
	}

	projTypes := []models.ProjectType{
		{ID: id.New(), Slug: "ap-mai-gia-dinh", Name: "Áp mái hộ gia đình", Description: strPtr("Hệ thống điện mặt trời mái nhà dân dụng")},
		{ID: id.New(), Slug: "ap-mai-doanh-nghiep", Name: "Áp mái tòa nhà thương mại", Description: strPtr("Điện mặt trời văn phòng, bệnh viện, trường học")},
		{ID: id.New(), Slug: "ap-mai-nha-xuong", Name: "Áp mái nhà xưởng công nghiệp", Description: strPtr("Điện mặt trời mái tôn khu công nghiệp công suất lớn")},
	}
	for _, pt := range projTypes {
		if db.Where("slug = ?", pt.Slug).First(&models.ProjectType{}).Error != nil {
			db.Create(&pt)
		}
	}

	var pvHCM, pvBinhDinh models.Province
	db.Where("code = '79'").First(&pvHCM)
	db.Where("code = '52'").First(&pvBinhDinh)

	var ptFamily, ptIndustrial models.ProjectType
	db.Where("slug = 'ap-mai-gia-dinh'").First(&ptFamily)
	db.Where("slug = 'ap-mai-nha-xuong'").First(&ptIndustrial)

	// Projects
	projects := []models.Project{
		{
			ID:            id.New(),
			Slug:          "he-thong-dien-mat-troi-hybrid-10kwp-go-vap-hcm",
			Title:         "Hệ thống điện mặt trời Hybrid 10kWp tại Biệt thự Gò Vấp, TP.HCM",
			ProjectTypeID: ptFamily.ID,
			ProvinceID:    pvHCM.ID,
			BranchID:      &branchHCM.ID,
			AudienceID:    &audHousehold.ID,
			Summary:       "Lắp đặt hệ thống 10kWp sử dụng Inverter Deye Hybrid và 18 tấm pin LONGi 550W, giải quyết triệt để vấn đề tiền điện bậc cao và mất điện đột xuất.",
			Status:        "published",
			PublishedAt:   &now,
		},
		{
			ID:            id.New(),
			Slug:          "du-an-dien-mat-troi-ap-mai-500kwp-kcn-nhon-hoi-quy-nhon",
			Title:         "Dự án điện mặt trời áp mái nhà xưởng 500kWp tại KCN Nhơn Hội, Quy Nhơn",
			ProjectTypeID: ptIndustrial.ID,
			ProvinceID:    pvBinhDinh.ID,
			BranchID:      &branchQN.ID,
			AudienceID:    &audIndustrial.ID,
			Summary:       "Công trình 500kWp giúp nhà máy chế biến thủy sản tiết kiệm 45% lượng điện năng tiêu thụ lưới ban ngày và giảm phát thải 480 tấn CO2 mỗi năm.",
			Status:        "published",
			PublishedAt:   &now,
		},
	}
	for _, prj := range projects {
		if db.Where("slug = ?", prj.Slug).First(&models.Project{}).Error != nil {
			db.Create(&prj)
		}
	}

	// 10. Tags & Articles
	tags := []models.Tag{
		{ID: id.New(), Slug: "kien-thuc-dien-mat-troi", DisplayName: "Kiến thức điện mặt trời", TagKind: "topic"},
		{ID: id.New(), Slug: "inverter-hybrid", DisplayName: "Inverter Hybrid", TagKind: "product"},
		{ID: id.New(), Slug: "tiet-kiem-dien", DisplayName: "Tiết kiệm điện", TagKind: "benefit"},
	}
	for _, t := range tags {
		if db.Where("slug = ?", t.Slug).First(&models.Tag{}).Error != nil {
			db.Create(&t)
		}
	}

	articles := []models.Article{
		{
			ID:          id.New(),
			Slug:        "huong-dan-chon-inverter-hybrid-va-pin-luu-tru-phu-hop",
			Title:       "Hướng Dẫn Lựa Chọn Inverter Hybrid và Pin Lưu Trữ Phù Hợp Cho Gia Đình",
			Excerpt:     "Tìm hiểu sự khác biệt giữa hệ thống hòa lưới thuần túy và hệ thống lưu trữ Hybrid, tiêu chí tính toán dung lượng pin theo hóa đơn tiền điện.",
			BodyJSON:    `{"blocks":[{"type":"paragraph","content":"Khi lựa chọn hệ thống điện mặt trời có lưu trữ, công suất biến tần và dung lượng pin lưu trữ là hai yếu tố quyết định hiệu quả đầu tư..."},{"type":"heading","content":"1. Tính toán phụ tải tiêu thụ ban đêm"},{"type":"paragraph","content":"Hãy kiểm tra số kWh điện sử dụng trong khung giờ từ 18:00 đến 06:00 sáng hôm sau để chọn dung lượng pin Lithium phù hợp."}]}`,
			Status:      "published",
			PublishedAt: &now,
			AuthorID:    &adminUser.ID,
		},
	}
	for _, art := range articles {
		if db.Where("slug = ?", art.Slug).First(&models.Article{}).Error != nil {
			db.Create(&art)
		}
	}

	// 11. Homepage CMS Page with Block Registry
	homeBlocks := []map[string]any{
		{
			"id":         "blk_hero_1",
			"type":       "heroCarousel",
			"version":    1,
			"enabled":    true,
			"sortOrder":  1,
			"visibility": "all",
			"data": map[string]any{
				"slides": []map[string]any{
					{
						"title":          "Giải Pháp Điện Mặt Trời & Lưu Trữ Năng Lượng Hàng Đầu",
						"subtitle":       "Đồng hành cùng hàng ngàn hộ gia đình và doanh nghiệp Việt Nam chuyển đổi năng lượng xanh, bền vững và tiết kiệm",
						"desktopMediaId": "hero_solar_desktop.webp",
						"mobileMediaId":  "hero_solar_mobile.webp",
						"overlayOpacity": 0.45,
						"cta": map[string]any{
							"label": "Nhận Tư Vấn & Báo Giá Miễn Phí",
							"target": map[string]any{
								"kind":    "leadForm",
								"formKey": "consultation",
							},
						},
					},
				},
			},
		},
		{
			"id":         "blk_features_2",
			"type":       "featureHighlights",
			"version":    1,
			"enabled":    true,
			"sortOrder":  2,
			"visibility": "all",
			"data": map[string]any{
				"items": []map[string]any{
					{"iconToken": "shield-check", "label": "100% Thiết Bị Chính Hãng", "description": "Nhập khẩu trực tiếp từ các thương hiệu Tier 1 thế giới"},
					{"iconToken": "award", "label": "Bảo Hành Hiệu Suất 25 Năm", "description": "Cam kết bảo dưỡng định kỳ và hỗ trợ kỹ thuật trọn đời"},
					{"iconToken": "map-pin", "label": "Khảo Sát Tận Nơi Miễn Phí", "description": "Kỹ sư đo đạc kết cấu mái và thiết kế bản vẽ 3D chuyên sâu"},
					{"iconToken": "zap", "label": "Thi Công Nhanh 2 - 3 Ngày", "description": "Quy trình tiêu chuẩn an toàn điện cao cấp, hòa lưới tức thì"},
				},
			},
		},
		{
			"id":         "blk_audience_3",
			"type":       "audienceShowcase",
			"version":    1,
			"enabled":    true,
			"sortOrder":  3,
			"visibility": "all",
			"data": map[string]any{
				"audienceCodes": []string{"household", "business", "industrial"},
			},
		},
		{
			"id":         "blk_categories_4",
			"type":       "categoryShowcase",
			"version":    1,
			"enabled":    true,
			"sortOrder":  4,
			"visibility": "all",
			"data": map[string]any{
				"categoryIds": []string{catInverter.ID, catPanel.ID, catStorage.ID},
				"displayMode": "grid",
			},
		},
		{
			"id":         "blk_lead_5",
			"type":       "leadForm",
			"version":    1,
			"enabled":    true,
			"sortOrder":  5,
			"visibility": "all",
			"data": map[string]any{
				"headline":    "Đăng Ký Tư Vấn Khảo Sát Mái Miễn Phí",
				"subheading":  "Đội ngũ kỹ sư BM SOLAR tại TP.HCM và Quy Nhơn sẵn sàng tư vấn giải pháp tối ưu cho công trình của bạn.",
				"consentText": "Tôi đồng ý cho BM SOLAR liên hệ tư vấn theo Chính sách bảo mật thông tin.",
			},
		},
	}
	homeBlocksJSON, _ := json.Marshal(homeBlocks)

	homePageID := id.New()
	homeRevID := id.New()

	homePage := models.Page{
		ID:                     homePageID,
		PageKey:                "home",
		RouteSlug:              "/",
		Title:                  "BM SOLAR — Giải Pháp Điện Mặt Trời & Lưu Trữ Uy Tín",
		Locale:                 "vi-VN",
		CurrentDraftRevisionID: &homeRevID,
		PublishedRevisionID:    &homeRevID,
		PublicationState:       "published",
	}

	homeRevision := models.PageRevision{
		ID:         homeRevID,
		PageID:     homePageID,
		RevisionNo: 1,
		BlocksJSON: string(homeBlocksJSON),
		SeoJSON:    strPtr(`{"metaTitle":"BM SOLAR — Lắp Đặt Điện Mặt Trời Chính Hãng","metaDescription":"BM SOLAR cung cấp giải pháp điện mặt trời áp mái hộ gia đình, doanh nghiệp và nhà xưởng với thiết bị Tier 1, bảo hành 25 năm.","robots":"index,follow"}`),
		CreatedBy:  &adminUser.ID,
	}

	var existingHomePage models.Page
	if db.Where("page_key = 'home'").First(&existingHomePage).Error != nil {
		db.Create(&homePage)
		db.Create(&homeRevision)
	}

	// 12. Solutions
	solutions := []models.Solution{
		{
			ID:                      id.New(),
			Slug:                    "ho-gia-dinh",
			Title:                   "Điện Mặt Trời Hộ Gia Đình & Biệt Thự",
			Subtitle:                "Hệ thống điện mặt trời áp mái 3kW - 10kW tiết kiệm hóa đơn tiền điện",
			AudienceCode:            "household",
			CapacityRange:           "3kW - 10kW",
			HeroImage:               "/images/designs/giai-phap-card-1.png",
			MonthlySavings:          "Từ 1.5 - 6 triệu đồng/tháng",
			RoiYears:                "4 - 5 năm",
			WarrantyPeriod:          "25 năm hiệu suất tấm pin",
			Overview:                "Hệ thống điện mặt trời mái nhà dành cho gia đình được BM SOLAR thiết kế chuẩn hóa thẩm mỹ cao, phù hợp với mọi kiến trúc mái ngói, mái tôn hoặc sân thượng bê tông. Hệ thống ưu tiên cấp điện trực tiếp cho thiết bị ban ngày, nạp đầy pin lưu trữ Lithium BESS, và tự động xả điện phục vụ nhu cầu ban đêm.",
			BenefitsJSON:            `[{"title":"Giảm 80 - 90% Hóa Đơn Điện","desc":"Sử dụng điện mặt trời tự sản tự tiêu cho điều hòa, tủ lạnh, bếp từ vào các khung giờ nắng cao điểm."},{"title":"Cấp Điện Liên Tục Khi Mất Lưới","desc":"Hệ thống chuyển mạch UPS siêu tốc < 10ms, giữ các thiết bị quan trọng hoạt động bình thường."},{"title":"Làm Mát Mái Nhà 3 - 5°C","desc":"Các tấm pin quang điện hấp thụ bức xạ trực tiếp, hoạt động như một lớp cách nhiệt tự nhiên."},{"title":"Giám Sát Thông Minh Qua Ứng Dụng","desc":"Theo dõi sản lượng điện, lượng pin lưu trữ và tiền điện tiết kiệm mỗi ngày trên điện thoại."}]`,
			EquipmentJSON:           `[{"name":"Tấm pin Canadian Solar 550W Mono Half-Cell","brand":"Canadian Solar (Tier 1)","warranty":"25 năm"},{"name":"Biến tần Inverter Deye Hybrid 1 Pha / 3 Pha","brand":"Deye Energy","warranty":"5 năm"},{"name":"Pin lưu trữ Lithium LiFePO4 Dyness 5.12kWh - 15kWh","brand":"Dyness","warranty":"10 năm"},{"name":"Tủ điện đóng cắt bảo vệ chuẩn IP65 (Schneider / Chint)","brand":"Châu Âu / Tier 1","warranty":"2 năm"},{"name":"Khung giàn nhôm anodize và kẹp pin chuyên dụng inox 304","brand":"BM SOLAR Standard","warranty":"10 năm"}]`,
			ProcessJSON:             `[{"step":1,"title":"Tiếp nhận & Tư vấn sơ bộ","desc":"Đánh giá hóa đơn tiền điện hiện tại và nhu cầu sử dụng của gia đình."},{"step":2,"title":"Khảo sát 3D thực tế tận nơi","desc":"Kỹ sư đo đạc hướng nắng, góc nghiêng mái và kết cấu chịu lực miễn phí."},{"step":3,"title":"Thiết kế kỹ thuật & Dự toán chi phí","desc":"Xuất bản vẽ 3D mô phỏng vị trí lắp đặt và bảng tính toán thời gian thu hồi vốn."},{"step":4,"title":"Thi công & Nghiệm thu an toàn","desc":"Đội ngũ kỹ sư BM SOLAR thi công nhanh trong 2 - 3 ngày, đấu nối thẩm mỹ."},{"step":5,"title":"Hỗ trợ thủ tục EVN & Bảo trì trọn đời","desc":"Bàn giao tài khoản giám sát từ xa và bảo dưỡng định kỳ hàng năm."}]`,
			RecommendedProductSlugs: `["inverter-hybrid-deye-5kw-1-pha","tam-pin-canadian-solar-550w-hiku6","pin-lithium-luu-tru-dyness-5-12kwh"]`,
			RelatedProjectSlugs:     `["biet-thu-bien-quy-nhon-15kwp-hybrid"]`,
			Status:                  "published",
			SortOrder:               1,
		},
		{
			ID:                      id.New(),
			Slug:                    "doanh-nghiep",
			Title:                   "Điện Mặt Trời Doanh Nghiệp & Thương Mại",
			Subtitle:                "Giải pháp tối ưu chi phí vận hành cho văn phòng, khách sạn, cửa hàng",
			AudienceCode:            "business",
			CapacityRange:           "20kWp - 100kWp",
			HeroImage:               "/images/designs/giai-phap-card-2.png",
			MonthlySavings:          "Từ 15 - 80 triệu đồng/tháng",
			RoiYears:                "3 - 4 năm",
			WarrantyPeriod:          "25 năm hiệu suất tấm pin",
			Overview:                "Giải pháp tối ưu hóa chi phí vận hành cho văn phòng, khách sạn, trung tâm thương mại và resort từ 20kWp đến 100kWp, cắt giảm mạnh biểu giá điện giờ cao điểm (lên tới 4.900đ/kWh), tăng tính cạnh tranh và nâng tầm thương hiệu xanh thân thiện môi trường.",
			BenefitsJSON:            `[{"title":"Triệt Tiêu Giá Điện Giờ Cao Điểm","desc":"Giờ cao điểm thương mại có giá điện cao nhất trùng với khung giờ bức xạ mặt trời cực đại từ 9h30 - 11h30."},{"title":"Hoàn Vốn Nhanh Chóng 3 - 4 Năm","desc":"Tỷ suất sinh lời hấp dẫn (IRR > 25%), sau khi thu hồi vốn doanh nghiệp được dùng điện miễn phí suốt hơn 20 năm tiếp theo."},{"title":"Nâng Cao Uy Tín Thương Hiệu Xanh","desc":"Khách sạn, resort và tòa nhà đạt tiêu chuẩn công trình xanh, thu hút khách hàng và đối tác quốc tế."},{"title":"Vận Hành Bền Bỉ, Không Gián Đoạn Kinh Doanh","desc":"BM SOLAR ứng dụng giải pháp thi công cuốn chiếu an toàn, đấu nối vào hệ thống điện hiện hữu không gây gián đoạn."}]`,
			EquipmentJSON:           `[{"name":"Tấm pin quang điện Canadian Solar / LONGi Tier 1 công suất 550W - 660W","brand":"Tier 1 Bloomberg","warranty":"25 năm"},{"name":"Biến tần hòa lưới Inverter 3 Pha công suất 25kW - 100kW","brand":"Huawei / Solis / Deye","warranty":"5 - 10 năm"},{"name":"Tủ điện phân phối đóng cắt ACB/MCCB, chống sét lan truyền Type 1+2","brand":"Schneider / ABB","warranty":"2 năm"},{"name":"Hệ thống giám sát điện năng từ xa Smart Logger & Cloud Portal","brand":"BM Smart Energy","warranty":"Trọn đời"},{"name":"Hệ thống giàn khung nhôm chuyên dụng và phụ kiện kẹp mái tôn/ngói","brand":"BM Heavy Solar Rack","warranty":"15 năm"}]`,
			ProcessJSON:             `[{"step":1,"title":"Thu thập biểu đồ phụ tải điện","desc":"Phân tích hóa đơn điện 12 tháng gần nhất và đo đạc biểu đồ tiêu thụ điện thời gian thực."},{"step":2,"title":"Khảo sát kết cấu mái & Hệ thống điện","desc":"Kiểm tra khả năng chịu lực của khung kèo xà gồ, trạm biến áp và không gian lắp đặt."},{"step":3,"title":"Lập hồ sơ tài chính & Báo cáo khả thi","desc":"Cung cấp bảng phân tích dòng tiền NPV, IRR, thời gian hoàn vốn và các phương án tài chính."},{"step":4,"title":"Thi công đạt chuẩn EPC quốc tế","desc":"Đội ngũ kỹ sư cơ điện giàu kinh nghiệm lắp đặt đúng kỹ thuật, an toàn PCCC tuyệt đối."},{"step":5,"title":"Đấu nối hòa lưới & Bàn giao SCADA","desc":"Hỗ trợ thủ tục thỏa thuận đấu nối với Điện lực (EVN) và chuyển giao phần mềm giám sát."}]`,
			RecommendedProductSlugs: `["tam-pin-canadian-solar-550w-hiku6","inverter-hybrid-deye-5kw-1-pha"]`,
			RelatedProjectSlugs:     `["khach-san-seagull-quy-nhon-80kwp"]`,
			Status:                  "published",
			SortOrder:               2,
		},
		{
			ID:                      id.New(),
			Slug:                    "nha-xuong-cong-nghiep",
			Title:                   "Điện Mặt Trời Nhà Xưởng & Công Nghiệp",
			Subtitle:                "Quy mô công suất lớn 100kWp - 1MWp+, đạt chứng chỉ xanh ESG",
			AudienceCode:            "industrial",
			CapacityRange:           "100kWp - 1MWp+",
			HeroImage:               "/images/designs/giai-phap-card-3.png",
			MonthlySavings:          "Từ 80 - 500+ triệu đồng/tháng",
			RoiYears:                "3.5 - 4.5 năm",
			WarrantyPeriod:          "25 năm hiệu suất tấm pin",
			Overview:                "Giải pháp điện mặt trời mái nhà quy mô công nghiệp từ 100kWp đến trên 1MWp dành cho nhà máy sản xuất, khu công nghiệp và kho logistics. Tích hợp giải pháp chống phát ngược Zero-Export thông minh, làm mát mái nhà xưởng 3-5°C và giúp doanh nghiệp đạt chứng chỉ năng lượng tái tạo I-REC, CBAM, đáp ứng tiêu chuẩn xanh ESG để xuất khẩu sang Mỹ và EU.",
			BenefitsJSON:            `[{"title":"Tiết Kiệm Hàng Trăm Triệu Mỗi Tháng","desc":"Sản xuất hàng triệu kWh điện sạch mỗi năm tại chỗ, giảm tải trực tiếp cho trạm biến áp nội bộ."},{"title":"Đạt Chứng Chỉ Xanh Xuất Khẩu ESG & I-REC","desc":"Cung cấp dữ liệu báo cáo phát thải carbon minh bạch, giúp sản phẩm dễ dàng thông quan vào các thị trường EU, Mỹ."},{"title":"Làm Mát Mái Xưởng Giảm 3 - 5°C","desc":"Lớp pin che phủ mái tôn rộng hàng ngàn m2 giúp giảm bức xạ nhiệt trực tiếp, tạo môi trường mát mẻ."},{"title":"Bảo Vệ & Kéo Dài Tuổi Thọ Tôn Mái","desc":"Tấm pin che chắn mưa đá, axit và nắng gắt, giảm hiện tượng oxy hóa rỉ sét của tôn mái."}]`,
			EquipmentJSON:           `[{"name":"Tấm pin công suất cao 600W - 670W N-type TOPCon","brand":"Canadian Solar / Jinko / LONGi","warranty":"25 năm hiệu suất 87.4%"},{"name":"Biến tần công nghiệp String Inverter 100kW - 125kW hiệu suất 99%","brand":"Huawei SUN2000 / Solis 110K","warranty":"5 - 10 năm"},{"name":"Bộ điều khiển phát ngược Zero-Export Controller","brand":"SmartLogger & CT chuyên dụng","warranty":"5 năm"},{"name":"Hệ thống PCCC & Chống sét lan truyền điện từ hiện đại","brand":"Schneider / Phoenix Contact","warranty":"2 năm"},{"name":"Khung ray kẹp Seamlock / Kliplok nhôm đúc không khoan thủng tôn","brand":"BM Industrial Clamp 6005-T6","warranty":"15 năm"}]`,
			ProcessJSON:             `[{"step":1,"title":"Thẩm định pháp lý & Kết cấu xưởng","desc":"Kiểm tra hồ sơ thiết kế chịu lực của nhà xưởng và điều kiện PCCC hiện hữu."},{"step":2,"title":"Thiết kế 3D & Mô phỏng PVSyst","desc":"Tính toán chính xác góc nghiêng, khoảng cách bóng đổ và dự báo sản lượng theo dữ liệu NASA."},{"step":3,"title":"Hồ sơ thỏa thuận đấu nối & PCCC","desc":"Đại diện chủ đầu tư thực hiện trọn gói hồ sơ thỏa thuận kỹ thuật đấu nối với Công ty Điện lực."},{"step":4,"title":"Thi công theo tiêu chuẩn an toàn HSE","desc":"Trang bị bảo hộ an toàn leo cao, giàn giáo đạt chuẩn, thi công không làm gián đoạn sản xuất."},{"step":5,"title":"Đo kiểm chất lượng & Bàn giao nghiệm thu","desc":"Dùng camera nhiệt kiểm tra Hotspot, đo điện trở cách điện Megger và nghiệm thu đóng điện."}]`,
			RecommendedProductSlugs: `["tam-pin-canadian-solar-550w-hiku6","inverter-hybrid-deye-5kw-1-pha"]`,
			RelatedProjectSlugs:     `["nha-may-may-phu-tai-binh-dinh-500kwp"]`,
			Status:                  "published",
			SortOrder:               3,
		},
	}

	for _, sol := range solutions {
		var existing models.Solution
		if db.Where("slug = ?", sol.Slug).First(&existing).Error != nil {
			db.Create(&sol)
		} else {
			db.Model(&existing).Updates(map[string]any{
				"title":           sol.Title,
				"subtitle":        sol.Subtitle,
				"capacity_range":  sol.CapacityRange,
				"monthly_savings": sol.MonthlySavings,
				"roi_years":       sol.RoiYears,
				"warranty_period": sol.WarrantyPeriod,
				"overview":        sol.Overview,
				"benefits_json":   sol.BenefitsJSON,
				"equipment_json":  sol.EquipmentJSON,
				"process_json":    sol.ProcessJSON,
				"status":          sol.Status,
				"sort_order":      sol.SortOrder,
			})
		}
	}

	return nil
}

func strPtr(s string) *string {
	return &s
}
