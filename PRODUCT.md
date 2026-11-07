# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14+ (App Router), React 18/19, TypeScript (Strict Mode), Tailwind CSS with custom design tokens, Lucide Icons, integrating with Golang API-first Backend at `http://localhost:3001/api/v1`.

## Users

1. **Hộ gia đình (Residential Homeowners):** Cần lắp đặt điện mặt trời mái nhà và hệ thống pin lưu trữ BESS để tiết kiệm tiền điện, chủ động nguồn điện khi mất điện, vận hành êm ái, thẩm mỹ và an toàn.
2. **Doanh nghiệp & Thương mại (Commercial & Business Owners):** Tìm kiếm giải pháp tối ưu hóa chi phí năng lượng giờ cao điểm, đạt chứng chỉ xanh (RECs / I-REC), nâng cao hình ảnh thương hiệu và khấu hao đầu tư rõ ràng.
3. **Chủ nhà xưởng & Khu công nghiệp (Industrial Factory Owners):** Cần hệ thống điện mặt trời quy mô lớn (hàng trăm kWp đến MWp), giải pháp hòa lưới không phát ngược (Zero-Export), trạm sạc xe điện EV và dịch vụ O&M bảo trì chuyên nghiệp.

## Product Purpose

BM SOLAR là nền tảng số đại diện cho Công ty TNHH Năng Lượng BM SOLAR — Tổng thầu EPC điện mặt trời, pin lưu trữ năng lượng và trạm sạc xe điện hàng đầu tại Việt Nam (với mạng lưới chi nhánh tại TP. Quy Nhơn, Bình Định và Quận Gò Vấp, TP. Hồ Chí Minh). Website phục vụ mục đích:
- Trình diễn năng lực giải pháp kỹ thuật thực tế và thư viện dự án tiêu biểu đã hòa lưới.
- Cung cấp danh mục thiết bị chính hãng (Inverter Deye/Growatt/Huawei/Solis, Tấm pin Canadian Solar/Jinko/Longi, Pin lưu trữ lithium BESS, Sạc xe điện EV).
- Thu thập nhu cầu tư vấn & khảo sát mái miễn phí (Leads CRM) với chuyển đổi cao từ cả Desktop và Mobile.
- Truyền thông bài viết kiến thức, chính sách năng lượng và cẩm nang kỹ thuật.

## Positioning

BM SOLAR định vị là Tổng thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng Đáng Tin Cậy Nhất Khu Vực Miền Trung & Nam Bộ:
- Cam kết thiết bị chuẩn Tier 1 quốc tế, bảo hành chính hãng đến 25 năm.
- Giải pháp khảo sát 3D mô phỏng góc nghiêng và bức xạ mặt trời chính xác từng mét vuông mái.
- Mạng lưới chi nhánh trực tiếp tại Quy Nhơn và TP.HCM với đội ngũ kỹ sư túc trực 24/7.
- Hệ thống hỗ trợ đa kênh (Hotline, Zalo OA chính thức, Form tư vấn thông minh phân bổ theo chi nhánh).

## Operating Context

- Khách hàng truy cập website trên điện thoại thông minh (chiếm >70% lưu lượng) khi đang có nhu cầu tìm hiểu hoặc so sánh bảng giá lắp đặt điện mặt trời.
- Khách hàng cần xem nhanh giải pháp cho đối tượng của mình (Gia đình / Doanh nghiệp / Nhà xưởng), xem năng lực dự án đã thi công thực tế tại địa phương (Bình Định, TP.HCM, Gia Lai, Phú Yên...), và bấm liên hệ ngay qua Hotline hoặc Zalo chỉ với 1 chạm.

## Capabilities and Constraints

- **Kiến trúc:** Next.js App Router (SSR, ISR, Server Components cho nội dung và SEO, Client Components cho tương tác).
- **Không hardcode nội dung:** 100% dữ liệu (Site shell, Menu điều hướng, Banners Hero, Danh mục sản phẩm, Dự án, Tin tức, Kênh liên hệ, Form tư vấn) được lấy từ Backend CMS thông qua API chuẩn hóa (`backend/docs/API_DOCUMENTATION.md`).
- **Thanh điều hướng Mobile cố định (Mobile Bottom Navigation):** 5 nút chức năng: **Trang chủ, Gọi ngay, Zalo, Tư vấn, Menu**. Nút Gọi ngay và Zalo tự động nhận diện số điện thoại theo chi nhánh được chọn (mặc định Quy Nhơn hoặc TP.HCM).
- **TypeScript Strict:** Tuyệt đối không dùng `any`, tuân thủ type-safe runtime validation và schema.
- **Visual Accuracy:** Tái tạo sát 100% bố cục, màu sắc, font chữ và tỷ lệ hình ảnh từ bộ thiết kế `frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs` và `references/`.

## Brand Commitments

- **Tên thương hiệu:** BM SOLAR (Công ty TNHH Năng Lượng BM SOLAR).
- **Logo chính thức:** `BM_SOLAR_logo.png` (sử dụng file gốc chất lượng cao từ dự án).
- **Bảng màu nhận diện:**
  - Primary Brand Blue: `#0D4EA6` (Màu xanh dương chủ đạo)
  - Deep Navy: `#0D2E63` (Màu xanh đậm thanh tiện ích, footer và overlay)
  - Accent / CTA Orange: `#FF6B19` (Màu cam nút kêu gọi hành động, nổi bật)
  - Dark Ink: `#12243D` (Màu chữ tiêu đề và văn bản)
  - Surface Neutral: `#F5F8FC` (Màu nền khối và thẻ dịch vụ)
  - White: `#FFFFFF` (Màu nền chính)
- **Typography:** Sans-serif tiếng Việt hiện đại, tối ưu khả năng đọc trên mọi màn hình.

## Evidence on Hand

- Toàn bộ thiết kế full-page chi tiết cho 7 trang (Trang chủ, Giới thiệu, Giải pháp, Sản phẩm, Dự án, Tin tức, Liên hệ) cả Desktop (1440px) và Mobile (390px) tại `BM_SOLAR_Full_Page_Designs/`.
- Ảnh tham chiếu mới nhất cho Trang chủ: `home-desktop-full.png`, `home-mobile-full.png`.
- Logo thương hiệu chất lượng cao: `BM_SOLAR_logo.png`.
- Tài liệu tích hợp API chi tiết 12 Phase: `backend/docs/API_DOCUMENTATION.md`.
- Backend Golang API đang chạy và sẵn sàng tích hợp: Base URL `http://localhost:3001/api/v1`.

## Product Principles

1. **Visual Fidelity First:** Bám sát tuyệt đối hình ảnh tham chiếu thiết kế, không tự ý biến tấu bố cục hay phong cách.
2. **CMS-Driven & Zero-Hardcode:** Toàn bộ nội dung kinh doanh đều cấu hình được từ CMS Backend.
3. **Mobile-First Conversion:** Tối ưu trải nghiệm chạm trên điện thoại, thanh liên hệ 5 nút tức thì (Gọi / Zalo / Tư vấn).
4. **Performance & Clean SEO:** SSR sạch, Lighthouse SEO >= 95, Core Web Vitals tối ưu (LCP <= 2.5s, CLS <= 0.1).
5. **Robust Type Safety:** Chuẩn TypeScript Strict, không sử dụng `any`, xử lý đầy đủ các trạng thái loading, skeleton, error và empty state.

