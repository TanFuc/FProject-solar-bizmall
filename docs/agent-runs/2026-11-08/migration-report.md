# Báo Cáo Chuyển Đổi Tương Thích Next 15 & Chuẩn Hóa Schema Types — BM SOLAR

**Thời gian:** 2026-11-08  
**Phạm vi phụ trách:** 4 route detail (`[slug]`), 3 route root listing (`san-pham`, `du-an`, `tin-tuc`), `sitemap.ts`, `robots.ts`, `structuredData.ts`, các file test matrix/pipeline.  
**Thực thi:** Hoàn toàn bằng thao tác tệp tin gốc, không chạy lệnh test/build cục bộ (bàn giao parent runner thực hiện trên Windows).

---

### 1. Nâng Cấp Tương Thích Next 15 Cho 4 Route Chi Tiết
Đã chuyển đổi kiểu `params` thành `Promise<{ slug: string }>` và sử dụng `await params` trong cả `generateMetadata` và page component:
- `frontend/src/app/san-pham/[slug]/page.tsx`
- `frontend/src/app/du-an/[slug]/page.tsx`
- `frontend/src/app/tin-tuc/[slug]/page.tsx`
- `frontend/src/app/giai-phap/[slug]/page.tsx`

Toàn bộ logic nghiệp vụ, giao diện, cấu trúc khối và dữ liệu đều được giữ nguyên vẹn 100%.

---

### 2. Nâng Cấp Tương Thích Next 15 Cho 3 Trang Danh Mục Chính
- **`searchParams` as Promise:** Cập nhật `searchParams?: Promise<{ ... }>` và `await searchParams` trước khi bóc tách tham số tại:
  - `frontend/src/app/san-pham/page.tsx`
  - `frontend/src/app/du-an/page.tsx`
  - `frontend/src/app/tin-tuc/page.tsx`
- **Chính sách SEO bộ lọc/tìm kiếm:** Hàm `generateMetadata` của cả 3 trang kiểm tra các tham số query (lọc danh mục, đối tượng, thương hiệu, sắp xếp, tìm kiếm từ khóa, phân trang > 1). Nếu có tham số hoạt động, thiết lập `noIndex: true`, trong khi đường dẫn canonical vẫn trỏ về route gốc (`/san-pham`, `/du-an`, `/tin-tuc`). Khi không có tham số bộ lọc, trang giữ nguyên trạng thái index bình thường.
- Giữ nguyên các cơ chế cuộn mượt (`scroll={false}`), bộ chỉ báo `CatalogPendingIndicator` và các component giao diện.

---

### 3. Chuẩn Hóa Sitemap Không Sử Dụng Dữ Liệu Giả
- Tại `frontend/src/app/sitemap.ts`: Đã gỡ bỏ toàn bộ việc import `fallbackProducts`, `fallbackProjects`, `fallbackArticles`.
- Khi API chưa sẵn sàng hoặc không có dữ liệu, sitemap trả về 0 bản ghi chi tiết thay vì phát sinh URL giả định; 7 trang tĩnh chính thống vẫn được đảm bảo lập chỉ mục đầy đủ.

---

### 4. Khắc Phục Lỗi TypeScript & Kiểu Schema Cho Tests
- Tại `frontend/src/lib/seo/structuredData.ts`:
  - Khai báo và xuất khẩu các interface chuẩn: `OrganizationSchema`, `LocalBusinessSchema`, `PostalAddressSchema`, `ContactPointSchema`.
  - Hàm `getOrganizationSchema` và `getLocalBusinessSchema` trả về các kiểu định nghĩa rõ ràng, khắc phục triệt để lỗi TypeScript `unknown property` (như `qnSchema.address`, `hcmSchema.address`, `parentOrganization`, `telephone`).
- Tại `frontend/tests/matrix.test.ts`:
  - Kịch bản `testBranchContacts` sử dụng đối tượng fixture `BranchItem` tường minh từ `utilityBar.branches` thay vì gọi hàm không tham số kỳ vọng dữ liệu hardcode cũ.
  - Kịch bản `testSitemap` kiểm tra tính toàn vẹn của các route tĩnh thay vì cố định độ dài tổng bằng hằng số giả định.
- Tại `frontend/tests/seo-pipeline.test.ts`: Loại bỏ các ép kiểu `as Array<...>`, truy cập trực tiếp các thuộc tính đã được định kiểu an toàn.
