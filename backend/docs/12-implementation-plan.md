# 12 — Implementation Plan & Phase Completion Report

Dự án đã được triển khai hoàn chỉnh bằng **Golang** theo mô hình Modular Monolith, vượt qua toàn bộ 12 phases mà không sử dụng NestJS hay mocks/stubs.

---

### Phase 1 — Architecture Foundations & Environment
- **Mục tiêu:** Cấu trúc dự án Golang, environment loader, structured logging `log/slog`, health probes, error envelopes.
- **Thực thi:**
  - `internal/config/config.go`: Đọc biến môi trường an toàn kèm giá trị mặc định.
  - `internal/common/errors/errors.go`: Envelope chuẩn `{ error: { code, message, requestId } }`.
  - `internal/common/middleware/`: Gắn RequestID, băm ẩn danh IP người dùng, đo thời gian request, panic recovery, CORS.
  - Health check endpoints: `/health/live` và `/health/ready`.
- **Kết quả:** Vượt qua test `TestHealthEndpoints`.

---

### Phase 2 — Relational Data Models & Multi-Engine Persistence
- **Mục tiêu:** 24 bảng dữ liệu quan hệ, hỗ trợ MariaDB 11.4 và Pure-Go SQLite, định danh ULID 26 ký tự.
- **Thực thi:**
  - `internal/common/id/ulid.go`: Sinh ULID 26 ký tự chuẩn `CHAR(26)`.
  - `internal/database/models/models.go`: 24 models GORM với đầy đủ khóa ngoại, chỉ mục (indexes), quan hệ n-n, outbox events, và audit logs.
  - `internal/database/db.go`: Quản lý pool kết nối CSDL và automigrations.
- **Kết quả:** Vượt qua automigrations và test bộ nhớ `database.ConnectTestMemory()`.

---

### Phase 3 — Identity, Relational RBAC & Passwords
- **Mục tiêu:** Quản trị danh tính, băm mật khẩu chuẩn Argon2id, JWT Access & Refresh tokens, phân quyền RBAC.
- **Thực thi:**
  - `internal/modules/identity/auth.go`: Thuật toán băm Argon2id có salt và time/memory cost; ký và kiểm tra JWT claims; middleware `RequireAuth`, `RequirePermission`.
  - `internal/modules/identity/handler.go`: Các endpoints `/admin/auth/login`, `/admin/auth/refresh`, `/admin/auth/logout`, `/admin/auth/me`, `/admin/users`, `/admin/roles`, `/admin/permissions`.
- **Kết quả:** Vượt qua test `TestPhase03_RBACAndAdminAuth`.

---

### Phase 4 — Media Management & Responsive Variants
- **Mục tiêu:** Tiếp nhận upload media, phân tích kích thước ảnh, tính toán responsive variants, phục vụ tệp tin tĩnh có caching.
- **Thực thi:**
  - `internal/modules/media/media.go`: Giải mã kích thước ảnh (JPEG, PNG, WebP), sinh định nghĩa variants (thumb_300, medium_768, large_1200, desktop_16_9, mobile_4_5).
  - `internal/modules/media/handler.go`: Upload multipart với giới hạn dung lượng, chặn xóa ảnh đang được sử dụng ở sản phẩm công khai, streaming tệp tin tĩnh `/media/{key}` kèm header `Cache-Control: public, max-age=31536000, immutable`.
- **Kết quả:** Hoàn thành module media và tích hợp liên kết ảnh.

---

### Phase 5 — Site Shell, Branches & Channel Resolution
- **Mục tiêu:** Phục vụ giao diện khung (shell) độc lập cho Frontend, chuẩn hóa E.164 cho số điện thoại, định tuyến liên hệ chi nhánh thông minh.
- **Thực thi:**
  - `internal/modules/cms/shell.go`: Chuẩn hóa số điện thoại E.164 (`NormalizePhone`), kiểm tra URL Zalo (`ValidateZaloTarget`).
  - `GET /public/site-shell`: Trả về toàn bộ nhận diện thương hiệu, theme tokens, navigation tree đa cấp, mobile action bar, và thông tin chi nhánh.
  - `GET /public/branches/{id}/channels`: Ưu tiên kênh liên hệ của chi nhánh được chọn, fallback về kênh toàn quốc nếu chi nhánh chưa cấu hình.
- **Kết quả:** Vượt qua tests `TestPublicSiteShell` và `TestBranchDiscoveryAndChannels`.

---

### Phase 6 — CMS Publishing Engine & Content Block Registry
- **Mục tiêu:** Quản trị trang động, discriminated content block registry (17 loại khối UI), vòng đời xuất bản nguyên tử, bảo toàn lịch sử bằng snapshot bất biến.
- **Thực thi:**
  - `internal/modules/cms/blocks.go`: Định nghĩa struct typed cho `heroCarousel`, `featureHighlights`, `categoryShowcase`, `audienceShowcase`, `richText`, `faq`,... kèm hàm `ValidateBlock`.
  - `internal/modules/cms/handler.go`: Vòng đời `draft -> in_review -> approved -> published -> archived`. Xuất bản nguyên tử cập nhật `published_revision_id`. Khôi phục tạo revision mới từ snapshot cũ. Preview token có chữ ký HMAC bảo mật.
  - Tuyệt đối không để lộ trang nháp (draft) ra endpoint công khai (trả về 404).
- **Kết quả:** Vượt qua tests `TestPublishedPageRetrievalAndETag` và `TestPhase06_PagePublishingLifecycle`.

---

### Phase 7 — Product Catalog & Technical Specifications
- **Mục tiêu:** Danh mục sản phẩm đa cấp, thương hiệu, nhóm khách hàng, thông số kỹ thuật JSON, bộ lọc đa tiêu chí và phân trang.
- **Thực thi:**
  - `internal/modules/catalog/handler.go`:
    - `GET /public/products`: Lọc theo danh mục (`category`), nhóm đối tượng (`audience`), thương hiệu (`brand`), tìm kiếm từ khóa (`search`), sắp xếp và phân trang.
    - `GET /public/products/{slug}`: Chi tiết sản phẩm, thư viện ảnh, thông số kỹ thuật chi tiết. Trả về 404 nếu sản phẩm chưa xuất bản.
    - CRUD danh mục, thương hiệu, sản phẩm phía Admin kèm xuất bản/hủy xuất bản.
- **Kết quả:** Vượt qua tests `TestProductListingAndFiltering` và `TestPhase07_CatalogAdminCRUD`.

---

### Phase 8 — Projects & Regional Showcase
- **Mục tiêu:** Danh mục công trình thực tế đã thi công, phân loại theo loại hình lắp đặt và địa phương (tỉnh/thành phố).
- **Thực thi:**
  - `internal/modules/projects/handler.go`:
    - `GET /public/project-types`: Danh sách loại hình dự án (áp mái gia đình, nhà xưởng,...).
    - `GET /public/provinces`: Danh sách tỉnh/thành phố (Hồ Chí Minh, Bình Định, Bình Dương,...).
    - `GET /public/projects`: Lọc theo loại công trình và tỉnh thành, phân trang.
    - `GET /public/projects/{slug}`: Chi tiết dự án kèm danh sách vật tư/sản phẩm đã sử dụng trong công trình.
- **Kết quả:** Tích hợp dữ liệu công trình thực tế hoàn thiện.

---

### Phase 9 — Editorial & Knowledge Base
- **Mục tiêu:** Bài viết tin tức, cẩm nang kiến thức, hệ thống gắn thẻ (tags) và liên kết sản phẩm nguồn.
- **Thực thi:**
  - `internal/modules/editorial/handler.go`:
    - `GET /public/articles`: Danh sách bài viết đã xuất bản, hỗ trợ lọc theo thẻ `tag`.
    - `GET /public/articles/{slug}`: Chi tiết bài viết, tác giả, thẻ đính kèm.
    - `GET /public/tags/{slug}`: Thông tin thẻ và danh sách bài viết liên quan.
    - Admin CRUD bài viết và thẻ, kiểm soát trạng thái nháp/xuất bản.
- **Kết quả:** Vượt qua biên dịch và tích hợp kiến trúc xuất bản.

---

### Phase 10 — Leads CRM, Attribution & Anti-Spam
- **Mục tiêu:** Tiếp nhận yêu cầu tư vấn ẩn danh, chống gửi trùng bằng `Idempotency-Key`, phân luồng chi nhánh, máy trạng thái xử lý lead và timeline bất biến.
- **Thực thi:**
  - `internal/modules/leads/handler.go`:
    - `POST /public/leads`: Kiểm tra `Idempotency-Key` (nếu gửi lại trả về cùng `referenceCode` mà không tạo bản ghi trùng), bắt buộc chấp thuận bảo mật (`privacyConsent=true`), chuẩn hóa số điện thoại, ghi nhận lịch sử tạo lead vào `lead_activities` và tạo sự kiện outbox `LeadCreated`.
    - Phân quyền theo chi nhánh: Nhân viên chi nhánh A không thể xem hoặc chỉnh sửa lead của chi nhánh B (trả về 403 Forbidden).
    - Máy trạng thái: `new -> assigned -> contacted -> qualified -> quoted -> won/lost/invalid`. Trạng thái kết thúc bắt buộc phải có lý do (`reason`).
- **Kết quả:** Vượt qua tests `TestLeadSubmissionAndIdempotency`, `TestLeadStateTransitionsAndTerminalReason`, và `TestPhase10_LeadBranchScoping`.

---

### Phase 11 — SEO Automation, Dynamic Sitemap & Redirects
- **Mục tiêu:** Chuẩn hóa slug tiếng Việt không dấu, sitemap.xml động, chuyển hướng 301/308, quy trình đề xuất nội dung SEO không phụ thuộc AI trả phí và kiểm duyệt trước khi xuất bản.
- **Thực thi:**
  - `internal/common/slug/slug.go`: Khử dấu tiếng Việt (`NormalizeVietnamese`), xử lý ký tự đặc biệt, chống trùng lặp.
  - `internal/modules/seo/sitemap.go`: Sinh `sitemap.xml` hợp chuẩn chứa toàn bộ trang, sản phẩm, dự án, bài viết đã xuất bản (loại trừ toàn bộ bản nháp).
  - `internal/modules/seo/handler.go`:
    - Quản lý và giải quyết chuyển hướng 301 (`GET /public/redirects/resolve`).
    - Quy trình tạo bản nháp SEO từ sản phẩm: `POST /admin/seo/generations` tạo nháp -> Biên tập viên duyệt -> Chuyển thành bài viết ở trạng thái `draft` (tuyệt đối không tự động xuất bản).
- **Kết quả:** Vượt qua tests `TestDynamicSitemap`, `TestPhase11_VietnameseSlugGenerator`, và `TestPhase11_SEOGenerationsAndDraftPipeline`.

---

### Phase 12 — Testing, Delivery & Integration Acceptance
- **Mục tiêu:** Kiểm thử toàn diện 100% tự động, hợp đồng OpenAPI 3.1 chi tiết, kịch bản seed dữ liệu mẫu hoàn chỉnh, cấu hình triển khai Docker Compose.
- **Thực thi:**
  - `contracts/openapi.yaml`: Đặc tả OpenAPI 3.1 đầy đủ tất cả schemas và endpoints.
  - `cmd/seed/main.go` & `internal/database/seed/seed.go`: Khởi tạo dữ liệu thực tế theo đúng hình ảnh tham chiếu UI (`reference/ui-reference.png`).
  - `Dockerfile` & `docker-compose.yml`: Triển khai chuẩn production với MariaDB và MinIO.
  - `test/unit_test.go` & `test/e2e_test.go`: 17 tests bao phủ toàn bộ các yêu cầu nghiệp vụ, chạy pass 100% chỉ trong ~2 giây.
- **Kết quả:** Toàn bộ hệ thống sẵn sàng vận hành.
