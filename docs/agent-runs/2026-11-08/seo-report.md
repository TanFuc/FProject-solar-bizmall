# Báo Cáo Hoàn Thiện SEO & Structured Data — BM SOLAR

**Thời gian:** 2026-11-08  
**Tình trạng kiểm thử môi trường:** Không thực thi lệnh shell/test cục bộ theo chỉ đạo; bàn giao toàn bộ kiểm thử cho parent runner trên Windows.

---

### 1. Chuẩn Hóa Structured Data Năng Động (Không Hardcode)
- **Cơ chế:** `getOrganizationSchema` trong `structuredData.ts` nhận tham số `shell?: Partial<SiteShellData> | null`, phân giải động 100% tên thương hiệu, logo CMS, các chi nhánh hoạt động, kênh liên hệ và mạng xã hội.
- **Xóa bỏ dữ liệu tĩnh & giả định:** Gỡ bỏ toàn bộ mảng `VERIFIED_BRANCHES`, tọa độ và mã bưu điện tự tạo. Khi không có `siteShell` khả dụng, hàm không phát sinh địa chỉ chi nhánh giả định.
- **`getLocalBusinessSchema`:** Khi nhận đối tượng `BranchItem`, trích xuất trung thực từ đối tượng đó. Với các lời gọi dạng chuỗi định danh cũ, hàm trả về khung tối thiểu mà không bịa đặt địa chỉ hay số điện thoại.

---

### 2. Browser Tab Icon & Web Manifest
- Tạo `frontend/src/app/favicon.ico/route.ts` và `frontend/src/app/apple-icon/route.ts` trả trực tiếp dữ liệu ảnh gốc từ `public/images/logo.png`, bảo toàn kênh alpha.
- Cập nhật trường `icons` trong `metadata.ts` và chèn `<link rel="icon">`, `<link rel="apple-touch-icon">` vào `<head>` của `layout.tsx`.
- Tạo `frontend/src/app/manifest.ts` khai báo đầy đủ icon PWA và màu sắc thương hiệu.

---

### 3. Khử Trùng Tiêu Đề & Kiểm Soát Noindex
- **Trùng lặp tiêu đề:** `constructMetadata` loại bỏ hậu tố `| BM SOLAR` trước khi khớp template `%s | BM SOLAR Việt Nam`, ngăn chặn lặp thương hiệu ở các trang con.
- **Root Layout:** Khi `getSiteShell()` gặp lỗi hoặc 429, layout hiển thị thông báo thân thiện: *"Hệ Thống Đang Tiếp Nhận Lượng Truy Cập Cao"*, kèm nút thử lại và gắn `<meta name="robots" content="noindex, nofollow" />` để tránh lập chỉ mục trạng thái lỗi.
- **Admin Portal:** [`frontend/src/app/admin/layout.tsx`](file:///mnt/c/Users/Local_2/OneDrive/Desktop/Project-NEW/FProject-solar-bizmall/frontend/src/app/admin/layout.tsx) được thiết lập `robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }`.

---

### 4. Ghi Chú Tích Hợp Cho Parent / Worker Trang Danh Mục
- **Trang lọc/tìm kiếm:** File `frontend/src/app/san-pham/page.tsx` thuộc quyền sở hữu của UI worker. Khi tích hợp canonical cho bộ lọc/tìm kiếm (searchParams), parent/UI worker có thể truyền `options: { noIndex: true }` vào `visualMetadata('products', '/san-pham', { noIndex: Boolean(searchParams?.q || searchParams?.category) })` để tránh chỉ mục hóa các trang kết quả tìm kiếm rỗng/trùng lặp.

---

### 5. Bộ Kiểm Thử Hồi Quy SEO
- Cập nhật `frontend/tests/seo-pipeline.test.ts` sử dụng 2 fixture độc lập (`fixtureShellA` và `fixtureShellB`). Xác minh việc thay đổi fixture tạo ra schema khác biệt tương ứng; xác minh trường hợp `null` không sinh dữ liệu giả; xác minh regression title deduplication, icon metadata, language alternates và noindex.
- Chuyển giao toàn bộ việc chạy test và typecheck cho parent runner trên Windows.
