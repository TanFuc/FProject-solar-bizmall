# 11 — Hợp đồng Tích hợp Frontend / Backend (FE Integration Contract)

## 1. Cơ chế Đồng bộ hóa Hợp đồng (Single Source of Truth)
Tệp `contracts/openapi.yaml` là hợp đồng kỹ thuật duy nhất giữa Backend (Golang) và Frontend (Next.js / Nuxt / React).
Mọi thay đổi trên API đều phải được phản ánh vào OpenAPI trước hoặc cùng lúc với mã nguồn Go.

### Quy trình Sinh Types cho Frontend:
Frontend sử dụng các công cụ sinh mã tự động từ OpenAPI để đảm bảo type-safety hoàn hảo giữa client và server:
```bash
# Lệnh sinh TypeScript types từ OpenAPI contract
npx openapi-typescript ../backend/contracts/openapi.yaml -o src/types/api.ts
```

---

## 2. Tiêu thụ Khối Nội dung CMS (Content Block Consumption)
Frontend định nghĩa Union Type tương ứng với danh sách Content Blocks mà Go backend cung cấp.
Khi render trang, Frontend duyệt qua mảng `blocks` từ API `GET /api/v1/public/pages/:pageKey` và dùng cấu trúc `switch-case`:

```typescript
// Định nghĩa kiểu dữ liệu đồng bộ với Go Block Structs
type HeroSlide = {
  title: string;
  subtitle?: string;
  desktopMediaId: string;
  mobileMediaId?: string;
  overlayOpacity: number;
  cta?: {
    label: string;
    kind: 'internalRoute' | 'contactChannel' | 'externalUrl' | 'leadForm';
    target: string;
  };
};

type HeroCarouselBlock = {
  id: string;
  type: 'heroCarousel';
  version: number;
  enabled: boolean;
  sortOrder: number;
  data: {
    slides: HeroSlide[];
  };
};

type FeatureHighlightsBlock = {
  id: string;
  type: 'featureHighlights';
  version: number;
  enabled: boolean;
  sortOrder: number;
  data: {
    items: Array<{ iconToken: string; title: string; description?: string }>;
  };
};

type ContentBlock = HeroCarouselBlock | FeatureHighlightsBlock /* | các block khác */;

// Hàm render an toàn phía Frontend
export function RenderBlock({ block }: { block: ContentBlock }) {
  if (!block.enabled) return null;

  switch (block.type) {
    case 'heroCarousel':
      return <HeroCarouselSection data={block.data} />;
    case 'featureHighlights':
      return <FeatureHighlightsSection data={block.data} />;
    default:
      // Fallback an toàn: Không làm sập toàn bộ trang nếu gặp block mới chưa hỗ trợ
      console.warn(`Block type chưa được hỗ trợ: ${(block as any).type}`);
      return null;
  }
}
```

---

## 3. Quy tắc Render SEO Phía Máy chủ (Server-Side Rendering - SSR)
Để đảm bảo tối ưu hóa công cụ tìm kiếm (SEO) tốt nhất cho BM SOLAR:
1. **Dữ liệu SEO phải có sẵn trong HTML ban đầu:**
   Trang chi tiết sản phẩm (`/san-pham/:slug`) hoặc bài viết (`/tin-tuc/:slug`) phải được fetch dữ liệu từ Go backend trong quá trình SSR (`getServerSideProps` hoặc Server Components trong Next.js).
2. **Không phụ thuộc vào Client-side JS để nạp tiêu đề:**
   Các thẻ `<title>`, `<meta name="description">`, `<link rel="canonical">`, và thẻ `<script type="application/ld+json">` phải được render trực tiếp trong HTML gửi về cho trình duyệt và crawler của Googlebot.
3. **Hình ảnh Tối ưu (Responsive Art Direction):**
   Frontend sử dụng thẻ `<picture>` kết hợp `<source media="(max-width: 768px)">` để nạp đúng ảnh dành cho mobile (`mobileMediaId`) hoặc desktop (`desktopMediaId`), kèm theo kích thước `width`, `height` được cung cấp từ Go backend để tránh giật khung hình (CLS <= 0.1).

---

## 4. Xử lý Nút Gọi / Zalo theo Chi nhánh đã Chọn
- Khi người dùng chọn chi nhánh trên thanh Header (hoặc nhận chi nhánh mặc định từ Site-Shell), Frontend lưu ID chi nhánh vào `localStorage` hoặc Cookie.
- Mọi nút bấm Gọi điện thoại (`tel:`) và nhắn tin Zalo (trên thanh Header, nút nổi Desktop, và Mobile Action Bar) đều truy vấn kênh liên hệ từ `GET /api/v1/public/branches/:id/channels` để kích hoạt đúng số của chi nhánh đó.
- Nếu chi nhánh chưa có cấu hình riêng, Frontend sẽ tự động sử dụng kênh mặc định toàn hệ thống do API trả về.
- Nút bấm Gọi điện thoại sử dụng định dạng `href="tel:+84912345678"` (chuẩn E.164) để kích hoạt trình quay số trên thiết bị di động của khách hàng.
