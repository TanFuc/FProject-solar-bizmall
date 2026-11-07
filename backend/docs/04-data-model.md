# 04 — Mô hình Dữ liệu Quan hệ & GORM Entities (MariaDB / Golang)

Toàn bộ thực thể dữ liệu sử dụng **ULID 26 ký tự (`CHAR(26)`)** làm khóa chính (Primary Key), được sắp xếp tuần tự theo thời gian tạo, tránh phân mảnh B-Tree index trong MariaDB/MySQL.
Tất cả các bảng đều có `created_at`, `updated_at` (chuẩn UTC). Các bảng mutable có thêm `version` (INT) để kiểm soát xung đột đồng thời (Optimistic Concurrency Control) và `created_by`, `updated_by`.

Bảng mã ký tự: `utf8mb4`, Collation: `utf8mb4_unicode_ci`.

---

## 1. Danh sách Bảng & GORM Struct Model Đại diện

### Module Hệ thống & Cấu hình (System & CMS Shell)
1. **`site_settings`** (Cấu hình toàn trang, singleton):
   ```go
   type SiteSetting struct {
       ID               string `gorm:"primaryKey;size:26" json:"id"`
       SiteName         string `gorm:"size:100;not null" json:"siteName"`
       DefaultLocale    string `gorm:"size:10;default:'vi-VN'" json:"defaultLocale"`
       DefaultBranchID  *string `gorm:"size:26" json:"defaultBranchId"`
       UtilityBarJSON   string `gorm:"type:longtext" json:"utilityBarJson"` // Structured config
       MobileActionJSON string `gorm:"type:longtext" json:"mobileActionJson"`
       FooterConfigJSON string `gorm:"type:longtext" json:"footerConfigJson"`
       Version          int    `gorm:"default:1" json:"version"`
       UpdatedAt        time.Time `json:"updatedAt"`
   }
   ```
2. **`theme_settings`** (Màu sắc thương hiệu & Design Tokens):
   ```go
   type ThemeSetting struct {
       ID          string `gorm:"primaryKey;size:26" json:"id"`
       PrimaryHex  string `gorm:"size:7;not null" json:"primaryHex"`   // e.g. #0D4EA6
       NavyHex     string `gorm:"size:7;not null" json:"navyHex"`      // e.g. #0D2E63
       AccentHex   string `gorm:"size:7;not null" json:"accentHex"`    // e.g. #FF6B19
       FontsToken  string `gorm:"size:50;default:'inter'" json:"fontsToken"`
       RadiusToken string `gorm:"size:20;default:'md'" json:"radiusToken"`
       UpdatedAt   time.Time `json:"updatedAt"`
   }
   ```
3. **`branches`** (Chi nhánh / Văn phòng đại diện):
   ```go
   type Branch struct {
       ID            string  `gorm:"primaryKey;size:26" json:"id"`
       Code          string  `gorm:"size:50;uniqueIndex;not null" json:"code"` // e.g. "go-vap", "quy-nhon"
       Slug          string  `gorm:"size:100;uniqueIndex;not null" json:"slug"`
       Name          string  `gorm:"size:150;not null" json:"name"`
       ProvinceCode  string  `gorm:"size:20;index;not null" json:"provinceCode"`
       StreetAddress string  `gorm:"size:255;not null" json:"streetAddress"`
       HoursJSON     string  `gorm:"type:text" json:"hoursJson"`
       GeoLat        *float64 `json:"geoLat"`
       GeoLng        *float64 `json:"geoLng"`
       IsActive      bool    `gorm:"default:true;index" json:"isActive"`
       CreatedAt     time.Time `json:"createdAt"`
       UpdatedAt     time.Time `json:"updatedAt"`
   }
   ```
4. **`contact_channels`** (Kênh liên hệ Hotline, Zalo, Email, MXH):
   ```go
   type ContactChannel struct {
       ID        string  `gorm:"primaryKey;size:26" json:"id"`
       BranchID  *string `gorm:"size:26;index" json:"branchId"` // NULL = Kênh chung toàn hệ thống
       Type      string  `gorm:"size:30;not null" json:"type"` // phone, zalo, email, facebook, youtube
       Label     string  `gorm:"size:100;not null" json:"label"`
       Target    string  `gorm:"size:255;not null" json:"target"` // SĐT E.164, link Zalo URL, email
       SortOrder int     `gorm:"default:0" json:"sortOrder"`
       Enabled   bool    `gorm:"default:true" json:"enabled"`
       CreatedAt time.Time `json:"createdAt"`
       UpdatedAt time.Time `json:"updatedAt"`
   }
   ```
5. **`navigation_menus` & `navigation_items`**:
   Menu điều hướng đa cấp (Header, Footer, Mobile Drawer) với `parent_id` tự tham chiếu (tối đa 3 cấp).

---

### Module Trang CMS & Bản xuất bản (CMS Pages & Revisions)
6. **`pages`**:
   ```go
   type Page struct {
       ID                  string     `gorm:"primaryKey;size:26" json:"id"`
       PageKey             string     `gorm:"size:50;uniqueIndex;not null" json:"pageKey"` // "home", "about", "contact"
       RouteSlug           string     `gorm:"size:100;uniqueIndex;not null" json:"routeSlug"`
       Locale              string     `gorm:"size:10;default:'vi-VN'" json:"locale"`
       CurrentDraftRevID   *string    `gorm:"size:26" json:"currentDraftRevisionId"`
       PublishedRevID      *string    `gorm:"size:26" json:"publishedRevisionId"`
       PublicationState    string     `gorm:"size:30;default:'draft'" json:"publicationState"` // draft, published, archived
       PublishedAt         *time.Time `json:"publishedAt"`
       CreatedAt           time.Time  `json:"createdAt"`
       UpdatedAt           time.Time  `json:"updatedAt"`
   }
   ```
7. **`page_revisions`** (Snapshot bất biến của toàn bộ block và SEO):
   ```go
   type PageRevision struct {
       ID         string    `gorm:"primaryKey;size:26" json:"id"`
       PageID     string    `gorm:"size:26;index;not null" json:"pageId"`
       RevisionNo int       `gorm:"not null" json:"revisionNo"`
       BlocksJSON string    `gorm:"type:longtext;not null" json:"blocksJson"` // Array of ContentBlock
       SeoJSON    string    `gorm:"type:longtext" json:"seoJson"`
       CreatedBy  string    `gorm:"size:26;not null" json:"createdBy"`
       CreatedAt  time.Time `gorm:"not null" json:"createdAt"`
   }
   ```

---

### Module Danh mục Sản phẩm & Thông số (Catalog Module)
8. **`audiences`**: Phân loại nhu cầu (`household` - Hộ gia đình, `business` - Doanh nghiệp, `industrial` - Nhà xưởng).
9. **`product_categories`**: Danh mục thiết bị (Biến tần Inverter, Tấm pin quang điện, Pin lưu trữ Lithium...).
10. **`brands`**: Hãng sản xuất / Thương hiệu ủy quyền (Deye, Huawei, Jinko, Growatt...).
11. **`products`**:
    ```go
    type Product struct {
        ID                string     `gorm:"primaryKey;size:26" json:"id"`
        SKU               string     `gorm:"size:50;uniqueIndex;not null" json:"sku"`
        Slug              string     `gorm:"size:120;uniqueIndex;not null" json:"slug"`
        Name              string     `gorm:"size:200;not null" json:"name"`
        CategoryID        string     `gorm:"size:26;index;not null" json:"categoryId"`
        BrandID           *string    `gorm:"size:26;index" json:"brandId"`
        Summary           string     `gorm:"type:text" json:"summary"`
        Description       string     `gorm:"type:longtext" json:"description"`
        Status            string     `gorm:"size:30;default:'draft';index" json:"status"` // draft, in_review, published, archived
        CoverMediaID      *string    `gorm:"size:26" json:"coverMediaId"`
        SpecificationJSON string     `gorm:"type:longtext" json:"specificationJson"` // Key-value specs
        PublishedAt       *time.Time `json:"publishedAt"`
        CreatedAt         time.Time  `json:"createdAt"`
        UpdatedAt         time.Time  `json:"updatedAt"`
    }
    ```
12. **`product_media`** & **`product_audiences`**: Bảng quan hệ nhiều-nhiều lưu trữ thư viện ảnh và nhóm khách hàng tương ứng của sản phẩm.

---

### Module Dự án Tiêu biểu (Projects Module)
13. **`project_types`**: Loại hình dự án (Áp mái hộ gia đình, Nhà máy công nghiệp, Trang trại năng lượng...).
14. **`provinces`**: Tỉnh thành thi công (Bình Định, TP.HCM, Bình Dương, Long An...).
15. **`projects`**:
    ```go
    type Project struct {
        ID            string     `gorm:"primaryKey;size:26" json:"id"`
        Slug          string     `gorm:"size:120;uniqueIndex;not null" json:"slug"`
        Title         string     `gorm:"size:255;not null" json:"title"`
        ProjectTypeID string     `gorm:"size:26;index;not null" json:"projectTypeId"`
        ProvinceCode  string     `gorm:"size:20;index;not null" json:"provinceCode"`
        BranchID      *string    `gorm:"size:26;index" json:"branchId"`
        AudienceCode  *string    `gorm:"size:30;index" json:"audienceCode"`
        CapacityKwp   *float64   `json:"capacityKwp"`
        Summary       string     `gorm:"type:text" json:"summary"`
        BodyJSON      string     `gorm:"type:longtext" json:"bodyJson"`
        CoverMediaID  *string    `gorm:"size:26" json:"coverMediaId"`
        CompletedAt   *time.Time `json:"completedAt"`
        Status        string     `gorm:"size:30;default:'draft';index" json:"status"`
        PublishedAt   *time.Time `json:"publishedAt"`
        CreatedAt     time.Time  `json:"createdAt"`
        UpdatedAt     time.Time  `json:"updatedAt"`
    }
    ```

---

### Module Tin tức & Bài viết (Editorial Module)
16. **`articles`**: Tin tức, cẩm nang kỹ thuật, bài so sánh giải pháp. Hỗ trợ liên kết bài viết tới sản phẩm gốc (`source_product_id`).
17. **`tags`** & **`content_tags`**: Hệ thống hashtag đa năng gắn cho Sản phẩm, Dự án, hoặc Bài viết.

---

### Module CRM Khách hàng Tiềm năng (Leads CRM Module)
18. **`leads`**:
    ```go
    type Lead struct {
        ID                   string     `gorm:"primaryKey;size:26" json:"id"`
        RefCode              string     `gorm:"size:32;uniqueIndex;not null" json:"refCode"` // BMS-202611-XXXX
        Name                 string     `gorm:"size:150;not null" json:"name"`
        Phone                string     `gorm:"size:30;index;not null" json:"phone"`
        Email                *string    `gorm:"size:150;index" json:"email"`
        BranchID             *string    `gorm:"size:26;index" json:"branchId"`
        AudienceCode         *string    `gorm:"size:30" json:"audienceCode"`
        ProductID            *string    `gorm:"size:26" json:"productId"`
        ProjectID            *string    `gorm:"size:26" json:"projectId"`
        Message              string     `gorm:"type:text" json:"message"`
        SourcePage           string     `gorm:"size:255" json:"sourcePage"`
        UtmJSON              string     `gorm:"type:text" json:"utmJson"`
        ConsentAt            time.Time  `gorm:"not null" json:"consentAt"`
        PrivacyPolicyVersion string     `gorm:"size:20;not null" json:"privacyPolicyVersion"`
        Status               string     `gorm:"size:30;default:'new';index" json:"status"` // new, assigned, contacted, qualified, quoted, won, lost, invalid
        AssigneeID           *string    `gorm:"size:26;index" json:"assigneeId"`
        AssignedAt           *time.Time `json:"assignedAt"`
        CreatedAt            time.Time  `gorm:"index" json:"createdAt"`
        UpdatedAt            time.Time  `json:"updatedAt"`
    }
    ```
19. **`lead_activities`** (Timeline hoạt động bất biến):
    ```go
    type LeadActivity struct {
        ID         string    `gorm:"primaryKey;size:26" json:"id"`
        LeadID     string    `gorm:"size:26;index;not null" json:"leadId"`
        ActorID    *string   `gorm:"size:26" json:"actorId"` // NULL nếu là hệ thống/khách hàng
        Kind       string    `gorm:"size:50;not null" json:"kind"` // created, status_changed, assigned, note_added
        FromStatus *string   `gorm:"size:30" json:"fromStatus"`
        ToStatus   *string   `gorm:"size:30" json:"toStatus"`
        Note       string    `gorm:"type:text" json:"note"`
        CreatedAt  time.Time `gorm:"not null" json:"createdAt"`
    }
    ```

---

### Module Media & Storage (Media Module)
20. **`media_assets`**: Lưu trữ khóa S3, MIME type, kích thước byte, độ phân giải (width, height), alt text và người tải lên.
21. **`media_variants`**: Các biến thể responsive (thumbnail, mobile, tablet, desktop, webp/avif) được sinh tự động.

---

### Module SEO & Tự động hóa (SEO Module)
22. **`seo_metadata`**: Meta title, description, canonical URL, robots (`index, follow`), OpenGraph media.
23. **`seo_redirects`**: Bảng lưu lịch sử chuyển hướng 301 khi thay đổi slug để không bị đứt gãy link SEO.
24. **`seo_generation_drafts`**: Lưu các bản nháp bài viết do bộ gợi ý SEO sinh ra từ thông số kỹ thuật sản phẩm, chờ người duyệt.

---

### Module Phân quyền & Kiểm toán (Identity, RBAC & Audit)
25. **`users`**, **`roles`**, **`permissions`**, **`user_roles`**, **`role_permissions`**: Mô hình RBAC quan hệ hoàn chỉnh.
26. **`audit_logs`**: Lưu nhật ký mọi hành động sửa đổi nhạy cảm (Ai, Hành động gì, Thực thể nào, Giá trị cũ/mới đã ẩn PII, Thời điểm, IP hash).
27. **`idempotency_records`**: Bảng ghi nhớ `Idempotency-Key` kèm hash payload và response để chống gửi trùng lặp yêu cầu lead.
