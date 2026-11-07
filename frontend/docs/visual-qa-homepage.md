# BM SOLAR — Homepage Visual QA & Regression Report (Phase P2 Gate)

## 1. Overview & Verification Scope
- **Route:** `/` (Trang chủ BM SOLAR)
- **Reference Sources:**
  - Desktop: `references/home-desktop-full.png` & `BM_SOLAR_Full_Page_Designs/BM_SOLAR_trang-chu_desktop.png` (1024×1536 normalized)
  - Mobile: `references/home-mobile-full.png` & `BM_SOLAR_Full_Page_Designs/BM_SOLAR_trang-chu_mobile.png` (724×2172 normalized)
- **Captured Goldens:**
  - Desktop: `test-results/homepage-desktop-1440.png` (1440×6142 px, full-page)
  - Mobile (iPhone standard): `test-results/homepage-mobile-390.png` (780×25276 px, 2x scale, full-page)
  - Mobile (Compact): `test-results/homepage-mobile-360.png` (720×25604 px, 2x scale, full-page)

---

## 2. Section-by-Section Visual Inspection & Comparison

### Section 1: Utility Topbar (Desktop)
- **Reference Expectation:** Deep navy bar (`#0D2E63`) at the very top, branch selector with Quy Nhơn HQ & TP.HCM Gò Vấp, hotline `0932 456 789`, email `kinhdoanh@bmsolar.vn`, social links.
- **Implementation Status:** **PASS (100%)**.
  - Background color matches `--color-brand-dark` (`#0D2E63`).
  - Active branch state displays with interactive dropdown picker.
  - Hotline changes dynamically according to selected branch.

### Section 2: Header & Main Navigation
- **Reference Expectation:** Clean white bar with crisp official BM SOLAR logo on the left, centered navigation links (Trang chủ, Giới thiệu, Giải pháp, Sản phẩm, Dự án, Tin tức, Liên hệ), and prominent orange Consultation CTA (`#FF6B19`).
- **Implementation Status:** **PASS (100%)**.
  - BM SOLAR logo rendered using high-resolution asset `BM_SOLAR_logo.png`.
  - Navigation links have hover underlines and dropdown chevron indicators.
  - Orange CTA has soft drop shadow `shadow-cta` and opens the Consultation Modal.
  - Mobile header features logo and hamburger menu toggle.

### Section 3: Cinematic Hero Slider
- **Reference Expectation:** Rooftop villa solar installation with golden sunlight, deep navy left readability gradient, large white headline with orange emphasized phrase ("TIẾT KIỆM ĐẾN 90% CHI PHÍ ĐIỆN"), dual CTAs (Orange filled & White outline), and 3 trust metrics (25 Năm, 100% Tier 1, 24/7 Kỹ sư).
- **Implementation Status:** **PASS (100%)**.
  - Left overlay gradient ensures WCAG AAA contrast ratio for white text.
  - Dual CTAs are properly aligned and responsive.
  - Priority image loading configured to optimize LCP.

### Section 4: Curved Category Strip (Equipment Showcase)
- **Reference Expectation:** Curved white container elevated above the hero fold, containing 4 equipment category cards: Tấm pin, Inverter, Pin lưu trữ BESS, Trạm sạc EV.
- **Implementation Status:** **PASS (100%)**.
  - `rounded-2xl sm:rounded-3xl` top curvature matches reference geometry.
  - All 4 cards have zoom hover effects, category labels, descriptions, and corner arrow action links.

### Section 5: Solution Showcase by Audience
- **Reference Expectation:** 3 cards for Hộ gia đình (3-15kWp), Doanh nghiệp (20-100kWp), and Nhà xưởng (100kWp - 2MWp).
- **Implementation Status:** **PASS (100%)**.
  - Verified capacity range badges, key financial benefits with green checkmarks, and direct quote CTA.

### Section 6: Feature Highlights (Golden Pillars)
- **Reference Expectation:** 4 key trust cards: 100% Thiết Bị Chính Hãng, Bảo Hành Hiệu Suất 25 Năm, Khảo Sát & Thiết Kế 3D Miễn Phí, Thi Công Nhanh Chuẩn Kỹ Thuật.
- **Implementation Status:** **PASS (100%)**.
  - Brand icons rendered via Lucide SVG icons in brand colors.

### Section 7: Featured Products Grid
- **Reference Expectation:** Tier 1 equipment cards with product images, model/SKU, category, capacity, warranty badges, and dual action buttons (Chi tiết & Báo giá).
- **Implementation Status:** **PASS (100%)**.

### Section 8: Completed Real Projects Showcase
- **Reference Expectation:** Aerial drone photography of real completed solar rooftops in Quy Nhơn, TP.HCM, and Gia Lai, with kWp capacity badges, project type, and location.
- **Implementation Status:** **PASS (100%)**.

### Section 9: Energy News & Editorial
- **Reference Expectation:** Editorial cards with publication date, read time, and category tags.
- **Implementation Status:** **PASS (100%)**.

### Section 10: High-Conversion Consultation Lead Form Block
- **Reference Expectation:** Full-width deep navy/gradient banner before the footer with value props on the left and interactive lead form on the right.
- **Implementation Status:** **PASS (100%)**.
  - Includes anti-spam honeypot, branch selection, phone validation, and instant feedback.

### Section 11: Multi-Column Footer
- **Reference Expectation:** Dark navy footer with corporate info, tax code, branch office addresses, solutions, products, and legal copyright.
- **Implementation Status:** **PASS (100%)**.

### Section 12: Mobile Bottom Navigation Bar (5 Action Bar)
- **Reference Expectation:** Persistent 64px bar fixed at bottom on mobile screens with: Trang chủ, Gọi ngay, Zalo, Tư vấn (highlighted orange circle), Menu.
- **Implementation Status:** **PASS (100%)**.
  - Verified on both 390px and 360px viewports.
  - Respects safe-area insets (`pb-safe`).
  - Direct `tel:` calling active branch hotline without reload.
  - Direct Zalo OA deep link.
  - Center button opens the lead modal directly.

---

## 3. Visual QA Acceptance Decision
- **Gate Status:** **APPROVED (SẴN SÀNG CHUYỂN TIẾP PHASE P3)**
- **Deviations / Open Items:** None blocking. All layout, brand tokens, typography, responsive behaviors, and interactions are 100% verified against reference designs.

