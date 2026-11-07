# 01 — Product Requirements & Scope (Golang Architecture)

## 1. Actors & Roles
- **Khách truy cập (Visitor - Anonymous):** Xem thông tin sản phẩm, dự án, tin tức, chi nhánh, giải pháp; lọc theo nhu cầu; gửi yêu cầu tư vấn/báo giá.
- **Người gửi Lead (Lead Submitter):** Khách hàng tiềm năng cung cấp thông tin liên hệ và chấp thuận chính sách quyền riêng tư.
- **Biên tập viên (Editor):** Soạn thảo trang CMS, bài viết, sản phẩm, quản lý media; lưu bản nháp (drafts) và gửi phê duyệt.
- **Người duyệt & Xuất bản (Publisher):** Xem xét bản nháp, duyệt và kích hoạt xuất bản (publish) hoặc lên lịch (schedule).
- **Chuyên viên kinh doanh (Sales Agent):** Tiếp nhận lead được phân công theo chi nhánh, cập nhật tiến độ tư vấn, ghi chú lịch sử.
- **Trưởng chi nhánh (Branch Manager):** Quản lý thông tin liên hệ của chi nhánh, theo dõi toàn bộ lead thuộc chi nhánh mình phụ trách.
- **Quản trị viên (Admin):** Quản trị danh mục sản phẩm, cấu hình website, điều hướng, footer, thương hiệu, người dùng nội bộ.
- **Quản trị viên cấp cao (Super Admin):** Toàn quyền hệ thống, phân quyền vai trò (RBAC), kiểm tra audit logs.
- **Quản trị SEO (SEO Manager):** Quản lý cấu hình SEO, từ khóa, sitemap, duyệt các bản nháp bài viết do công cụ SEO AI sinh ra.

## 2. Public Website Pages (Định tuyến phía Frontend)
- Trang chủ (`/`): Tổng quan thương hiệu, hero slide, điểm nổi bật, nhóm nhu cầu, sản phẩm & dự án tiêu biểu, form tư vấn.
- Giới thiệu (`/gioi-thieu`): Thông tin công ty, năng lực, đối tác.
- Giải pháp (`/giai-phap`, `/giai-phap/:slug`): Các gói giải pháp điện mặt trời (Hộ gia đình, Doanh nghiệp, Nhà xưởng).
- Sản phẩm (`/san-pham`, `/san-pham/:slug`): Danh mục thiết bị (Inverter, Tấm pin, Pin lưu trữ...), chi tiết thông số kỹ thuật.
- Dự án (`/du-an`, `/du-an/:slug`): Dự án thực tế đã hoàn thành, bộ lọc theo tỉnh thành/giải pháp.
- Tin tức (`/tin-tuc`, `/tin-tuc/:slug`): Bài viết chuyên ngành, kiến thức, cẩm nang năng lượng mặt trời.
- Cộng đồng / Mạng xã hội (`/cong-dong`): Kênh kết nối mạng xã hội.
- Liên hệ (`/lien-he`): Hệ thống chi nhánh, bản đồ, kênh liên hệ và biểu mẫu tư vấn.

## 3. Use Cases Trọng tâm
1. **Truy cập Trang chủ:** API `/api/v1/public/site-shell` trả về thương hiệu, theme tokens, menu, footer, cấu hình mobile action bar; API `/api/v1/public/pages/home` trả về danh sách block nội dung theo thứ tự sắp xếp.
2. **Chọn Chi nhánh (Branch Resolution):** Khi khách chọn chi nhánh (hoặc dùng chi nhánh mặc định), API `/api/v1/public/branches/:id/channels` cung cấp số hotline, Zalo link, email chính xác của chi nhánh đó, hỗ trợ ghi nhận nguồn gốc lead.
3. **Bộ lọc Sản phẩm & Dự án:** Khách hàng lọc sản phẩm theo danh mục, đối tượng phục vụ (`household`, `business`, `industrial`); lọc dự án theo tỉnh thành và loại dự án với tốc độ phản hồi cực nhanh từ Go backend.
4. **Gửi yêu cầu tư vấn (Lead Intake):** Khách gửi form kèm thông tin liên hệ, sự đồng thuận chính sách riêng tư; hệ thống gán mã tham chiếu duy nhất (`ref_code`), kiểm tra tính trùng lặp qua `Idempotency-Key`, chống spam và kích hoạt luồng gán chi nhánh.
5. **Soạn thảo và Xuất bản CMS:** Biên tập viên chỉnh sửa các block trên trang, lưu phiên bản (revision). Người có thẩm quyền kích hoạt xuất bản nguyên tử (atomic publish), tự động cập nhật ETag và vô hiệu hóa cache.
6. **Tự động hóa SEO:** Tạo slug chuẩn hóa từ tiếng Việt không dấu, gợi ý meta tags, hashtags và nội dung draft từ thông số sản phẩm mà không vi phạm chính sách của công cụ tìm kiếm.

## 4. Mục tiêu Phi chức năng (Nonfunctional Requirements)
- **Hiệu năng & Khả năng chịu tải (Go Engine):** Độ trễ đọc Public API p95 < 100ms tại 200 RPS với MariaDB; tận dụng tối đa goroutines và kết nối connection pooling của GORM/Go net/http.
- **Bộ nhớ tối ưu:** Ứng dụng Golang tiêu thụ RAM < 50MB ở trạng thái nhàn rỗi và < 150MB khi chịu tải cao (vượt trội so với Node.js/NestJS).
- **Tính khả dụng:** Mục tiêu 99.9%, tự phục hồi nhanh (fast cold start < 500ms).
- **Khả năng tiếp cận & Trải nghiệm:** Phù hợp chuẩn WCAG 2.2 AA; hình ảnh responsive tối ưu cho cả desktop và mobile.
- **Bảo mật:** Giới hạn tần suất gọi API (Rate limiting), mã hóa mật khẩu Argon2id, che giấu thông tin cá nhân (PII redaction) trong log hệ thống, kiểm tra tính hợp lệ của mọi request payload qua `validator/v10`.

## 5. Danh mục Yêu cầu Nghiệp vụ (Requirement IDs)
- **REQ-CMS-001:** Toàn bộ nội dung hiển thị trên giao diện quản trị được qua Admin API (CRUD).
- **REQ-CMS-002:** Hỗ trợ bản nháp (draft), xem trước (preview có token bảo mật), và quay lui phiên bản (revision rollback).
- **REQ-CMS-003:** Hỗ trợ biến thể media riêng biệt cho Desktop và Mobile trong các content blocks.
- **REQ-API-001:** Toàn bộ API được đánh phiên bản (`/api/v1`), cấu trúc response nhất quán.
- **REQ-API-002:** Hỗ trợ phân trang chuẩn (`page`, `pageSize`, `total`, `totalPages`) và bộ lọc an toàn.
- **REQ-API-003:** Hỗ trợ ETag và HTTP Caching cho các public read endpoints.
- **REQ-API-004:** Cấu trúc lỗi định chuẩn (Error Envelope) kèm `requestId`.
- **REQ-CRM-001:** Tiếp nhận lead ẩn danh, sinh mã tra cứu duy nhất và ghi nhận thời điểm đồng thuận chính sách.
- **REQ-CRM-002:** Tự động điều phối lead về chi nhánh phù hợp dựa trên lựa chọn của khách.
- **REQ-CRM-003:** Lịch sử hoạt động của lead (timeline) là bản ghi bất biến (append-only), không cho phép sửa/xóa.
- **REQ-SEO-001:** Quản lý slug duy nhất, tự động tạo chuyển hướng 301 khi thay đổi URL.
- **REQ-SEO-002:** Tạo XML sitemap động theo thời gian thực chứa các trang đã xuất bản.
- **REQ-SEO-003:** Công cụ gợi ý SEO draft dựa trên thông số kỹ thuật thực tế của sản phẩm.
- **REQ-SEO-004:** Tuân thủ quy chuẩn của Google, tuyệt đối không hứa hẹn sai về vị trí hiển thị hay dùng Google Indexing API sai mục đích.
