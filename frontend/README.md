# BM SOLAR — Frontend Web Portal (Next.js 14 App Router)

Trang thông tin & cổng thương mại điện tử chính thức của **Công ty TNHH Năng Lượng BM SOLAR** — Tổng thầu EPC Điện mặt trời, Pin lưu trữ BESS và Trạm sạc xe điện hàng đầu tại Quy Nhơn, TP. Hồ Chí Minh và toàn quốc.

---

## 1. Công Nghệ & Kiến Trúc

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript Strict (`strict: true`, zero `any`).
- **Styling**: Tailwind CSS với Design Tokens quy chuẩn theo `DESIGN.md`:
  - `brand-primary`: `#0D4EA6` (Xanh kỹ thuật BM Solar)
  - `brand-secondary`: `#F37021` (Cam năng lượng mặt trời)
  - `brand-dark`: `#0B3C7B`
  - `brand-darker`: `#062046`
  - `surface-white`: `#FFFFFF`, `surface`: `#F8FAFC`
- **Backend Architecture**: Tương thích hoàn toàn với Golang Modular Monolith API backend (`http://localhost:3001/api/v1`) theo tài liệu `backend/docs/API_DOCUMENTATION.md` cùng bộ fallback Mock Data đầy đủ khi chạy offline.
- **SSR & SSG**: Pre-render tĩnh toàn bộ 26 routes (trang chủ, 6 họ trang đầy đủ và các trang chi tiết `[slug]`).
- **Shared First-Load JS**: Chỉ **87.3 kB** tối ưu tốc độ tải và điểm Core Web Vitals.

---

## 2. Các Trang & Cấu Trúc Tuyến Đường (Routes)

| Tuyến đường | Mô tả | Chế độ Render |
|---|---|---|
| `/` | Trang chủ BM SOLAR (8 CMS Blocks theo ảnh thiết kế) | Static (○) |
| `/gioi-thieu` | Giới thiệu năng lực, lịch sử, chứng nhận CO/CQ & đội ngũ kỹ sư | Static (○) |
| `/giai-phap` | Hệ thống giải pháp EPC: Hộ gia đình, Doanh nghiệp & Nhà xưởng | Static (○) |
| `/giai-phap/[slug]` | Chi tiết giải pháp kỹ thuật, thông số & bảng phân tích ROI | SSG (●) |
| `/san-pham` | Danh mục thiết bị: Inverter Hybrid, Pin BESS, Canadian Solar, EV Charger | Static (ƒ / SSR) |
| `/san-pham/[slug]` | Chi tiết sản phẩm, thông số kỹ thuật, bảo hành chính hãng | SSG (●) |
| `/du-an` | Hồ sơ dự án thực tế tiêu biểu đã hòa lưới thành công | Static (ƒ / SSR) |
| `/du-an/[slug]` | Chi tiết công trình, hình ảnh thực tế, sản lượng điện hàng tháng | SSG (●) |
| `/tin-tuc` | Cổng thông tin kỹ thuật, chính sách ĐMT mái nhà tự sản tự tiêu | Static (ƒ / SSR) |
| `/tin-tuc/[slug]` | Chi tiết bài viết, phân tích chuyên gia & gợi ý giải pháp | SSG (●) |
| `/lien-he` | Bản đồ mạng lưới chi nhánh Quy Nhơn & TP.HCM, hotline, Zalo, FAQ | Static (○) |
| `/sitemap.xml` | XML Sitemap chuẩn kỹ thuật SEO với `lastModified` thực tế | Dynamic XML (○) |
| `/robots.txt` | Cấu hình cho bọ tìm kiếm Google, Bing | Text (○) |
| `/api/cms/revalidate` | Server-only Signed Webhook (HMAC-SHA256 & Bearer token) | API Route (ƒ) |

---

## 3. Tính Năng & Tiêu Chuẩn Triển Khai

### 3.1. Navigation & Trải Nghiệm Mobile
- **Desktop TopBar & Header**: Chuyển đổi chi nhánh động (Quy Nhơn / TP.HCM), tự cập nhật hotline và Zalo tương ứng.
- **Mobile Bottom Navigation Bar (5 nút cố định)**:
  1. **Trang chủ** (`/`)
  2. **Gọi ngay** (`tel:...`) — gắn trực tiếp hotline chi nhánh đang chọn.
  3. **Zalo** (`https://zalo.me/...`) — mở chat hỗ trợ kỹ thuật tức thời.
  4. **Tư vấn** — mở Modal đăng ký khảo sát / báo giá nhanh.
  5. **Menu** — mở Drawer điều hướng đầy đủ danh mục.

### 3.2. Technical SEO & Schema.org JSON-LD
- Tự động nhúng dữ liệu có cấu trúc chuẩn Schema.org:
  - `Organization`: Khai báo pháp nhân, trụ sở, hotline, email, logo.
  - `WebSite`: Khai báo SearchAction tìm kiếm sản phẩm trực tiếp.
  - `LocalBusiness`: Khai báo trụ sở chính Quy Nhơn và chi nhánh Gò Vấp, TP.HCM.
  - `Product`: Khai báo thông tin thiết bị thực tế, tuyệt đối không tạo đánh giá / giá bán ảo.
  - `BlogPosting`: Khai báo tác giả, ngày đăng, ngày sửa bài viết kỹ thuật.
  - `Service` & `CreativeWork`: Khai báo giải pháp EPC và dự án tiêu biểu.
  - `BreadcrumbList`: Danh mục điều hướng phân cấp cho Google Search Bots.

### 3.3. Automatic Keyword & Hashtag Pipeline
- Pipeline xử lý tiếng Việt chuyên sâu trong `src/lib/seo/hashtagPipeline.ts`:
  - Khử dấu tiếng Việt chuẩn Unicode NFD (`đ/Đ` -> `d/D`).
  - Lọc stopwords tiếng Việt (`và, của, cho, tại, là...`).
  - Sinh hashtag định dạng PascalCase (ví dụ: `#BMSOLAR`, `#DienMatTroi`, `#PinLuuTruBess`).
  - Khử trùng lặp không phân biệt hoa thường và dấu.

### 3.4. Indexing Automation & Outbox Security
- Tuân thủ nghiêm ngặt Google Terms of Service theo tài liệu `13_INDEXING_AUTOMATION.md`:
  - Không lạm dụng Google Indexing API cho trang sản phẩm/tin tức/dự án thông thường.
  - Xử lý các sự kiện Outbox: `ContentPublished`, `ContentUpdated`, `ContentUnpublished`, `ContentMoved`.
  - Webhook `/api/cms/revalidate` bảo mật bằng chữ ký HMAC-SHA256 (`x-bmsolar-signature`) và Bearer token.
  - Kiểm tra đối chiếu danh sách trắng (allowlist) các route công khai, loại trừ hoàn toàn các đường dẫn quản trị.

### 3.5. Loading Performance & Core Web Vitals
- Sọ tải (Skeletons) chuyên biệt cho sản phẩm (`ProductCardSkeleton`), tin tức (`ArticleCardSkeleton`), biểu tượng thương hiệu (`LoadingMark`).
- Đảm bảo CLS < 0.1 với tỷ lệ khung hình định hình trước (aspect-ratio).
- Thuộc tính hình ảnh tối ưu với `next/image` và `sizes` responsive.

### 3.6. Full i18n Internationalization (Đa Ngôn Ngữ Toàn Diện: Tiếng Việt 🇻🇳 & English 🇬🇧)
- **Hệ Thống Từ Điển**: Cấu trúc từ điển đồng bộ 100% key parity giữa `src/lib/i18n/dictionaries/vi.ts` và `en.ts` với hơn 130 cụm từ kỹ thuật quang điện chuẩn quốc tế.
- **Context & Persistence**: `I18nProvider` lưu trữ tùy chọn ngôn ngữ trong `NEXT_LOCALE` cookie và `localStorage`, tự động gán thuộc tính HTML `lang="vi"` hoặc `lang="en"`.
- **Language Switcher Components**:
  - Desktop: Nút chuyển đổi nhanh `🇻🇳 VN | 🇬🇧 EN` tích hợp trên `TopBar`.
  - Mobile: Thẻ chọn ngôn ngữ trực quan có cờ quốc kỳ trong `MobileDrawer`.
- **SEO Alternates**: Tự động khai báo thẻ hreflang alternates `vi-VN` và `en-US` trong metadata cho Googlebot.

---

## 4. Lệnh Vận Hành & Kiểm Thử

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển (Port 3000)
npm run dev

# 3. Kiểm tra tính nghiêm ngặt TypeScript (0 errors)
npm run typecheck

# 4. Chạy toàn bộ test suites (SEO, Test Matrix & i18n Parity)
npm run test
# Hoặc chạy riêng từng test:
npm run test:seo      # Test pipeline SEO & Hashtag tiếng Việt
npm run test:matrix   # Test matrix sản xuất 6/6 kịch bản
npm run test:i18n     # Test kiểm tra tính toàn vẹn đa ngôn ngữ 4/4

# 5. Biên dịch sản xuất (Production Build)
npm run build

# 6. Khởi chạy máy chủ sản xuất
npm run start
```

---

*Bản quyền © 2026 BM SOLAR Việt Nam. Phát triển tuân thủ Impeccable Craft Standards & Google Search Central Guidelines.*

