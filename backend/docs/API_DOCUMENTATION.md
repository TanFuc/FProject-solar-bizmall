# BM SOLAR — HƯỚNG DẪN TÍCH HỢP TOÀN BỘ API DÀNH CHO FRONTEND

> **Dành cho:** Kỹ sư Frontend (Next.js / Nuxt / React / Vue)  
> **Phiên bản:** v1.0.0 (Golang API-First Monolith)  
> **Base URL:** `http://localhost:3001/api/v1` (Dev) | `https://api.bmsolar.vn/api/v1` (Prod)  
> **Chuẩn truyền dữ liệu:** `application/json; charset=utf-8` | Thời gian: ISO-8601 UTC (`2026-11-06T16:00:00Z`)

---

## MỤC LỤC
1. [Quy chuẩn Chung & Error Envelope](#1-quy-chuẩn-chung--error-envelope)
2. [TypeScript Definitions (Copy-Paste trực tiếp vào FE)](#2-typescript-definitions)
3. [Đặc tả Content Block Registry (Trang CMS)](#3-đặc-tả-content-block-registry)
4. [Nhóm Public APIs (Website Khách hàng)](#4-nhóm-public-apis)
   - [4.1 Khởi động & Site-Shell](#41-khởi-động--site-shell)
   - [4.2 Chi nhánh & Kênh liên hệ Hotline/Zalo](#42-chi-nhánh--kênh-liên-hệ-hotlinezalo)
   - [4.3 Trang CMS Động & ETag Caching](#43-trang-cms-động--etag-caching)
   - [4.4 Danh mục & Sản phẩm Thiết bị](#44-danh-mục--sản-phẩm-thiết-bị)
   - [4.5 Dự án Thực tế & Vùng miền](#45-dự-án-thực-tế--vùng-miền)
   - [4.6 Tin tức, Bài viết & Hashtags](#46-tin-tức-bài-viết--hashtags)
   - [4.7 Form Tư vấn Khách hàng (Leads CRM)](#47-form-tư-vấn-khách-hàng-leads-crm)
   - [4.8 Dynamic Sitemap & SEO Redirects](#48-dynamic-sitemap--seo-redirects)
5. [Nhóm Admin APIs (Trang Quản trị)](#5-nhóm-admin-apis)
   - [5.1 Xác thực Admin (Auth JWT & Cookies)](#51-xác-thực-admin-auth-jwt--cookies)
   - [5.2 Quản trị Giao diện (Theme, Site Settings, Navigation)](#52-quản-trị-giao-diện)
   - [5.3 Quản trị Xuất bản Trang CMS (Revisions & Publish)](#53-quản-trị-xuất-bản-trang-cms)
   - [5.4 Quản trị Danh mục & Sản phẩm](#54-quản-trị-danh-mục--sản-phẩm)
   - [5.5 Quản trị Dự án Tiêu biểu](#55-quản-trị-dự-án-tiêu-biểu)
   - [5.6 Quản trị Tin tức & Bài viết](#56-quản-trị-tin-tức--bài-viết)
   - [5.7 Quản trị CRM Leads & Máy Trạng thái](#57-quản-trị-crm-leads--máy-trạng-thái)
   - [5.8 Tự động hóa SEO & AI Draft](#58-tự-động-hóa-seo--ai-draft)
   - [5.9 Upload Media Thư viện](#59-upload-media-thư-viện)
6. [Mã Lỗi Hệ Thống & Hướng Xử Lý Phía Client](#6-mã-lỗi-hệ-thống--hướng-xử-lý)

---

## 1. QUY CHUẨN CHUNG & ERROR ENVELOPE

### 1.1 Cấu trúc Headers
- `Content-Type: application/json`: Bắt buộc với mọi request `POST`, `PUT`.
- `Authorization: Bearer <access_token>`: Bắt buộc với các API nhóm Admin.
- `X-Request-ID`: Client có thể gửi lên UUID hoặc để backend tự sinh; luôn có trong response header để đối soát log.
- `Idempotency-Key`: Bắt buộc khi gọi `POST /public/leads` để chống gửi lặp form (ví dụ: người dùng bấm double-click).

### 1.2 Cấu trúc Phản hồi Thành công

**Dạng Chi tiết / Thao tác Đơn lẻ:**
```json
{
  "data": { ... }
}
```

**Dạng Danh sách Phân trang:**
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 12,
    "total": 48,
    "totalPages": 4
  },
  "filters": {
    "categories": [ ... ],
    "brands": [ ... ],
    "audiences": [ ... ]
  }
}
```

### 1.3 Cấu trúc Phản hồi Lỗi Chuẩn (Error Envelope)
Khi có lỗi (status `4xx` hoặc `5xx`), backend luôn trả về duy nhất một cấu trúc:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu gửi lên không đúng định dạng",
    "details": [
      {
        "field": "phone",
        "issue": "Số điện thoại Việt Nam không hợp lệ"
      }
    ],
    "requestId": "01M6RVG7PWATYQG4254QY0QQXM"
  }
}
```

---

## 2. TYPESCRIPT DEFINITIONS

Lưu file này tại `src/types/bmsolar-api.ts` trong dự án Frontend để tái sử dụng hoàn toàn kiểu dữ liệu:

```typescript
// ==================== COMMON ====================
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T, F = Record<string, any>> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters?: F;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
    requestId: string;
  };
}

// ==================== SITE SHELL & CHANNELS ====================
export interface BrandConfig {
  name: string;
  logo: {
    url: string;
    alt: string;
  };
}

export interface ContactChannelItem {
  id: string;
  type: 'phone' | 'zalo' | 'email' | 'facebook' | 'youtube';
  label: string;
  target: string;
  actionUrl?: string; // Ví dụ: "tel:+84901234567" hoặc "https://zalo.me/..."
  formatted?: string;
  sortOrder: number;
}

export interface BranchItem {
  id: string;
  code: string;
  slug: string;
  name: string;
  streetAddress: string;
  hours?: Record<string, string>;
  isActive: boolean;
  channels: ContactChannelItem[];
}

export interface NavigationItemTree {
  id: string;
  label: string;
  targetKind: 'internalRoute' | 'externalUrl' | 'contactChannel' | 'leadForm';
  targetRef?: string;
  externalUrl?: string;
  visibility: 'all' | 'desktopOnly' | 'mobileOnly';
  children?: NavigationItemTree[];
}

export interface MobileActionBarItem {
  key: string;
  label: string;
  icon: string;
  target: {
    kind: 'internalRoute' | 'contactChannel';
    routeKey?: string;
    channelType?: 'phone' | 'zalo';
  };
}

export interface ThemeTokens {
  primary: string; // VD: "#0D4EA6"
  navy: string;    // VD: "#0D2E63"
  accent: string;  // VD: "#FF6B19"
  fonts: string;
  radius: string;
}

export interface SiteShellData {
  brand: BrandConfig;
  utilityBar: {
    visible: boolean;
    showHotline: boolean;
    showEmail: boolean;
    announcement?: string;
    branches: BranchItem[];
  };
  navigation: NavigationItemTree[];
  footer: {
    companyName?: string;
    taxCode?: string;
    address?: string;
    hotline?: string;
    email?: string;
    legalText?: string;
  };
  globalChannels: {
    channels: ContactChannelItem[];
  };
  mobileActions: MobileActionBarItem[];
  theme: ThemeTokens;
}

// ==================== CATALOG & PRODUCTS ====================
export interface ProductCategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: string;
}

export interface BrandItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface AudienceItem {
  id: string;
  code: 'household' | 'business' | 'industrial';
  label: string;
  description?: string;
  enabled: boolean;
}

export interface ProductCard {
  id: string;
  sku: string;
  slug: string;
  name: string;
  summary: string;
  status: string;
  coverMediaUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductDetail extends ProductCard {
  description: string;
  specificationJson?: string; // Chứa JSON string map các thông số
  specsParsed?: Record<string, string>; // Parsed từ specificationJson
  media: Array<{
    id: string;
    mediaUrl: string;
    altText?: string;
    sortOrder: number;
  }>;
  audiences: Array<{
    code: string;
    label: string;
  }>;
}

// ==================== PROJECTS ====================
export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverMediaUrl?: string;
  completedAt?: string;
  projectType?: {
    id: string;
    name: string;
    slug: string;
  };
  province?: {
    id: string;
    name: string;
    code: string;
  };
}

// ==================== EDITORIAL ====================
export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverMediaUrl?: string;
  publishedAt?: string;
  bodyJson?: string;
}

// ==================== LEADS ====================
export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  branchId?: string;
  audienceId?: string;
  productId?: string;
  projectId?: string;
  message: string;
  sourcePage: string;
  privacyConsent: boolean;
  privacyPolicyVersion: string;
  honeypot?: string; // Phải để rỗng, dùng để bẫy spam bot
}
```

---

## 3. ĐẶC TẢ CONTENT BLOCK REGISTRY

Khi gọi `GET /api/v1/public/pages/:pageKey` (ví dụ trang `home`), trường `blocks` trả về một mảng gồm các khối nội dung được sắp xếp theo thứ tự hiển thị `sortOrder`.

### Các loại Block được hỗ trợ:

#### Block 1: `heroCarousel` (Banner chính)
```json
{
  "id": "blk_hero_1",
  "type": "heroCarousel",
  "version": 1,
  "enabled": true,
  "sortOrder": 1,
  "visibility": "all",
  "data": {
    "slides": [
      {
        "title": "TIÊN PHONG NĂNG LƯỢNG SẠCH CHO MỌI NGÔI NHÀ & DOANH NGHIỆP",
        "subtitle": "Giải pháp điện mặt trời hòa lưới & lưu trữ cao cấp, bảo hành 25 năm chính hãng cùng BM SOLAR.",
        "desktopMediaUrl": "http://localhost:3001/media/hero_desktop.webp",
        "mobileMediaUrl": "http://localhost:3001/media/hero_mobile.webp",
        "overlayOpacity": 0.45,
        "cta": {
          "label": "Nhận Báo Giá Ngay",
          "target": {
            "kind": "leadForm",
            "formKey": "consultation"
          }
        }
      }
    ]
  }
}
```

#### Block 2: `featureHighlights` (Khối Lợi ích nổi bật)
```json
{
  "id": "blk_features_2",
  "type": "featureHighlights",
  "version": 1,
  "enabled": true,
  "sortOrder": 2,
  "visibility": "all",
  "data": {
    "items": [
      {
        "iconToken": "shield-check",
        "label": "100% Thiết Bị Chính Hãng",
        "description": "Nhập khẩu trực tiếp từ các thương hiệu Tier 1 thế giới"
      },
      {
        "iconToken": "award",
        "label": "Bảo Hành Hiệu Suất 25 Năm",
        "description": "Cam kết bảo dưỡng định kỳ và hỗ trợ kỹ thuật trọn đời"
      },
      {
        "iconToken": "map-pin",
        "label": "Khảo Sát Tận Nơi Miễn Phí",
        "description": "Kỹ sư đo đạc kết cấu mái và thiết kế bản vẽ 3D chuyên sâu"
      },
      {
        "iconToken": "zap",
        "label": "Thi Công Nhanh 2 - 3 Ngày",
        "description": "Quy trình tiêu chuẩn an toàn điện cao cấp, hòa lưới tức thì"
      }
    ]
  }
}
```

#### Block 3: `categoryShowcase` (Danh mục Thiết bị Nhanh)
```json
{
  "id": "blk_cat_3",
  "type": "categoryShowcase",
  "version": 1,
  "enabled": true,
  "sortOrder": 3,
  "visibility": "all",
  "data": {
    "categoryIds": ["inverter-hoa-luoi", "tam-pin-quang-dien", "pin-luu-tru-lithium"],
    "displayMode": "grid"
  }
}
```

#### Block 4: `audienceShowcase` (Khối Phân loại Nhóm Khách Hàng)
```json
{
  "id": "blk_aud_4",
  "type": "audienceShowcase",
  "version": 1,
  "enabled": true,
  "sortOrder": 4,
  "visibility": "all",
  "data": {
    "audienceCodes": ["household", "business", "industrial"]
  }
}
```

#### Block 5: `leadForm` & `contactPanel` (Biểu mẫu Tư vấn Trực tiếp)
```json
{
  "id": "blk_lead_5",
  "type": "leadForm",
  "version": 1,
  "enabled": true,
  "sortOrder": 5,
  "visibility": "all",
  "data": {
    "headline": "Đăng Ký Khảo Sát & Nhận Báo Giá Miễn Phí",
    "subheading": "Đội ngũ kỹ sư BM SOLAR tại TP.HCM và Quy Nhơn sẵn sàng tư vấn trong vòng 15 phút.",
    "consentText": "Tôi đồng ý cho BM SOLAR liên hệ tư vấn theo Chính sách bảo mật thông tin."
  }
}
```

---

## 4. NHÓM PUBLIC APIS (DÀNH CHO KHÁCH TRUY CẬP)

### 4.1 Khởi động & Site-Shell
API nạp toàn bộ thông tin thương hiệu, menu, footer, và cấu hình nút mobile. FE nên gọi trong layout gốc (`RootLayout` trong Next.js App Router).

#### `GET /api/v1/public/site-shell`
- **Mô tả:** Lấy toàn bộ khung cấu hình website.
- **Request Headers:** Không bắt buộc.
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": {
    "brand": {
      "name": "BM SOLAR — Giải Pháp Năng Lượng Mặt Trời Toàn Diện",
      "logo": {
        "url": "http://localhost:3001/media/logo.webp",
        "alt": "BM SOLAR"
      }
    },
    "utilityBar": {
      "visible": true,
      "showHotline": true,
      "showEmail": true,
      "announcement": "Đơn vị lắp đặt điện mặt trời trọn gói hàng đầu miền Trung & Nam",
      "branches": [
        {
          "id": "01M6RVG7PWATYQG4254QY0QQXM",
          "code": "HCM-GV",
          "slug": "go-vap",
          "name": "Trụ sở chính Gò Vấp - TP.HCM",
          "streetAddress": "123 Quang Trung, P.10, Gò Vấp, TP. Hồ Chí Minh",
          "isActive": true,
          "channels": [
            {
              "id": "ch_1",
              "type": "phone",
              "label": "Hotline Gò Vấp",
              "target": "+84901234567",
              "actionUrl": "tel:+84901234567"
            }
          ]
        }
      ]
    },
    "navigation": [
      {
        "id": "nav_1",
        "label": "Trang chủ",
        "targetKind": "internalRoute",
        "targetRef": "home",
        "visibility": "all"
      },
      {
        "id": "nav_2",
        "label": "Sản phẩm",
        "targetKind": "internalRoute",
        "targetRef": "products",
        "visibility": "all"
      }
    ],
    "footer": {
      "companyName": "CÔNG TY CỔ PHẦN ĐẦU TƯ & NĂNG LƯỢNG BM SOLAR",
      "taxCode": "0316899999",
      "address": "456 An Dương Vương, TP. Quy Nhơn, Bình Định",
      "hotline": "1900 123 456 - 0907 654 321",
      "email": "contact@bmsolar.vn",
      "legalText": "© 2026 BM SOLAR. Tất cả quyền được bảo lưu."
    },
    "mobileActions": [
      {
        "key": "home",
        "label": "Trang chủ",
        "icon": "home",
        "target": { "kind": "internalRoute", "routeKey": "home" }
      },
      {
        "key": "products",
        "label": "Sản phẩm",
        "icon": "grid",
        "target": { "kind": "internalRoute", "routeKey": "products" }
      },
      {
        "key": "call",
        "label": "Gọi ngay",
        "icon": "phone",
        "target": { "kind": "contactChannel", "channelType": "phone" }
      },
      {
        "key": "zalo",
        "label": "Zalo",
        "icon": "message-circle",
        "target": { "kind": "contactChannel", "channelType": "zalo" }
      },
      {
        "key": "menu",
        "label": "Menu",
        "icon": "menu",
        "target": { "kind": "internalRoute", "routeKey": "menu" }
      }
    ],
    "theme": {
      "primary": "#0D4EA6",
      "navy": "#0D2E63",
      "accent": "#FF6B19",
      "fonts": "inter",
      "radius": "md"
    }
  }
}
```

---

### 4.2 Chi nhánh & Kênh liên hệ Hotline/Zalo

#### `GET /api/v1/public/branches`
- **Mô tả:** Lấy danh sách các chi nhánh đang hoạt động.
- **Query Params:** `active=true` (mặc định: `true`).

#### `GET /api/v1/public/branches/:id/channels`
- **Mô tả:** Lấy kênh liên hệ riêng của chi nhánh đã chọn (tự động fallback về kênh chung toàn quốc nếu chi nhánh chưa cài đặt).
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": [
    {
      "id": "ch_phone_1",
      "type": "phone",
      "label": "Hotline Gò Vấp",
      "target": "+84901234567",
      "actionUrl": "tel:+84901234567",
      "sortOrder": 1
    },
    {
      "id": "ch_zalo_1",
      "type": "zalo",
      "label": "Zalo Tư Vấn",
      "target": "https://zalo.me/0901234567",
      "actionUrl": "https://zalo.me/0901234567",
      "sortOrder": 2
    }
  ]
}
```
> **Lưu ý Frontend:** Khi người dùng đổi chi nhánh trên dropdown, lưu `branchId` vào `localStorage`, sau đó gọi API này để cập nhật đích đến của các nút Gọi điện thoại và nút nhắn tin Zalo.

---

### 4.3 Trang CMS Động & ETag Caching

#### `GET /api/v1/public/pages/:pageKey`
- **Path Params:** `pageKey` (ví dụ: `home`, `about`, `solutions`, `contact`).
- **Headers:** `If-None-Match: <etag>` (Hỗ trợ 304 Not Modified tiết kiệm băng thông).
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": {
    "pageKey": "home",
    "slug": "/",
    "title": "BM SOLAR — Giải Pháp Điện Mặt Trời & Lưu Trữ Uy Tín",
    "locale": "vi-VN",
    "publicationState": "published",
    "revisionNo": 1,
    "blocks": [ ... ],
    "seo": {
      "metaTitle": "BM SOLAR — Lắp Đặt Điện Mặt Trời Chính Hãng",
      "metaDescription": "BM SOLAR cung cấp giải pháp điện mặt trời áp mái hộ gia đình và nhà xưởng, bảo hành 25 năm.",
      "robots": "index,follow",
      "canonicalUrl": "https://bmsolar.vn/"
    }
  }
}
```
- **Xử lý mã lỗi:**
  - `404 NOT_FOUND`: Trang chưa được tạo hoặc **chưa được xuất bản (đang ở trạng thái Draft)**.

---

### 4.4 Danh mục & Sản phẩm Thiết bị

#### `GET /api/v1/public/product-categories`
- **Mô tả:** Lấy danh sách cây danh mục sản phẩm (Inverter, Tấm pin, Pin lưu trữ...).

#### `GET /api/v1/public/audiences`
- **Mô tả:** Lấy danh sách 3 nhóm đối tượng khách hàng (`household`, `business`, `industrial`).

#### `GET /api/v1/public/products`
- **Query Params:**
  - `category` (string, optional): Slug của danh mục (ví dụ `inverter-hoa-luoi`).
  - `brand` (string, optional): Slug thương hiệu (ví dụ `deye`, `jinko`).
  - `audience` (string, optional): Mã nhóm đối tượng (`household`, `business`, `industrial`).
  - `page` (number, default: `1`).
  - `pageSize` (number, default: `12`, max: `50`).
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": [
    {
      "id": "prod_1",
      "sku": "INV-DEYE-SUN-5K",
      "slug": "inverter-deye-hybrid-5kw-sun-5k-sg03lp1-eu",
      "name": "Inverter Deye Hybrid 5kW 1 Pha SUN-5K-SG03LP1-EU",
      "summary": "Biến tần Hybrid 5kW 1 pha Deye, hỗ trợ lưu trữ 48V, chuẩn IP65, hiệu suất 97.6%.",
      "coverMediaUrl": "http://localhost:3001/media/deye_5kw.webp",
      "category": {
        "id": "cat_1",
        "name": "Biến tần Inverter Hòa Lưới & Hybrid",
        "slug": "inverter-hoa-luoi"
      },
      "brand": {
        "id": "br_1",
        "name": "Deye Solar",
        "slug": "deye"
      }
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /api/v1/public/products/:slug`
- **Path Params:** `slug` của sản phẩm.
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": {
    "id": "prod_1",
    "sku": "INV-DEYE-SUN-5K",
    "slug": "inverter-deye-hybrid-5kw-sun-5k-sg03lp1-eu",
    "name": "Inverter Deye Hybrid 5kW 1 Pha SUN-5K-SG03LP1-EU",
    "summary": "Biến tần Hybrid 5kW 1 pha Deye...",
    "description": "<p>Nội dung chi tiết giới thiệu sản phẩm...</p>",
    "specificationJson": "{\"Công suất AC\":\"5000W\",\"Điện áp danh định\":\"230V 1 Pha\",\"Hiệu suất tối đa\":\"97.6%\"}",
    "media": [
      {
        "id": "med_1",
        "mediaUrl": "http://localhost:3001/media/deye_5kw_front.webp",
        "altText": "Mặt trước Inverter Deye 5kW",
        "sortOrder": 1
      }
    ],
    "audiences": [
      { "code": "household", "label": "Hộ gia đình" }
    ]
  }
}
```

---

### 4.5 Dự án Thực tế & Vùng miền

#### `GET /api/v1/public/project-types`
- Danh sách loại hình dự án (Áp mái hộ gia đình, Nhà xưởng công nghiệp...).

#### `GET /api/v1/public/provinces`
- Danh sách tỉnh thành thi công (Bình Định, TP.HCM, Bình Dương...).

#### `GET /api/v1/public/projects`
- **Query Params:** `projectType`, `province`, `page`, `pageSize`.

#### `GET /api/v1/public/projects/:slug`
- **Phản hồi mẫu (`200 OK`):**
```json
{
  "data": {
    "id": "proj_1",
    "slug": "du-an-ap-mai-biet-thu-quy-nhon-15kw",
    "title": "Dự Án Áp Mái Biệt Thự Đảo Quy Nhơn 15kWp Hệ Hybrid",
    "summary": "Hệ thống điện mặt trời hòa lưới có lưu trữ 15kWp...",
    "bodyJson": "{\"location\":\"Khu đô thị sinh thái Quy Nhơn, Bình Định\",\"panels\":\"30 tấm Jinko 550W\"}",
    "completedAt": "2026-03-15T00:00:00Z",
    "projectType": { "name": "Điện Mặt Trời Áp Mái Gia Đình" },
    "province": { "name": "Tỉnh Bình Định" }
  }
}
```

---

### 4.6 Tin tức, Bài viết & Hashtags

#### `GET /api/v1/public/articles`
- **Query Params:** `category`, `page`, `pageSize`.

#### `GET /api/v1/public/articles/:slug`
- Chi tiết bài viết tin tức, cẩm nang kỹ thuật.

#### `GET /api/v1/public/tags/:slug`
- Danh sách nội dung được gắn thẻ hashtag (ví dụ: `/public/tags/inverter-deye`).

---

### 4.7 Form Tư vấn Khách hàng (Leads CRM)

#### `POST /api/v1/public/leads`
- **Headers bắt buộc:**
  - `Content-Type: application/json`
  - `Idempotency-Key: <chuỗi_ngẫu_nhiên_duy_nhất>` (Khuyến nghị dùng `crypto.randomUUID()`)
- **Request Body mẫu:**
```json
{
  "name": "Nguyễn Văn An",
  "phone": "0912345678",
  "email": "nguyenvanan@gmail.com",
  "branchId": "01M6RVG7PWATYQG4254QY0QQXM",
  "message": "Tôi muốn tư vấn hệ thống điện mặt trời 5kW cho gia đình tại Gò Vấp",
  "sourcePage": "/san-pham/inverter-deye-hybrid-5kw",
  "privacyConsent": true,
  "privacyPolicyVersion": "v1.0",
  "honeypot": ""
}
```

- **Phản hồi Thành công (`201 Created`):**
```json
{
  "data": {
    "referenceCode": "BMS-202611-7890",
    "status": "new",
    "message": "Yêu cầu tư vấn của bạn đã được tiếp nhận. Đội ngũ kỹ sư BM SOLAR sẽ liên hệ trong ít phút!"
  }
}
```

- **Quy tắc Nghiệp vụ quan trọng:**
  1. `phone`: Chấp nhận định dạng Việt Nam (`09...`, `+84...`). Backend tự chuẩn hóa sang E.164 (`+84912345678`).
  2. `privacyConsent`: Phải là `true` (Người dùng phải tích chọn đồng ý điều khoản).
  3. `honeypot`: Trường input ẩn trên giao diện; nếu bot tự động điền giá trị vào đây, request sẽ bị âm thầm từ chối để chống spam.
  4. Nếu bấm gửi lại với cùng `Idempotency-Key`, hệ thống trả về kết quả cũ kèm mã `referenceCode` đã lưu mà không tạo lead mới.

---

### 4.8 Dynamic Sitemap & SEO Redirects

#### `GET /api/v1/public/sitemap.xml`
- **Mô tả:** Tệp XML Sitemap chứa danh sách toàn bộ các trang và sản phẩm đã xuất bản (không chứa trang Draft hoặc 404).

#### `GET /api/v1/public/redirects/resolve?path=<url_cũ>`
- **Mô tả:** Tra cứu xem URL cũ có chuyển hướng 301 sang URL mới hay không để Frontend thực hiện redirect vĩnh viễn.

---

## 5. NHÓM ADMIN APIS (DÀNH CHO HỆ THỐNG QUẢN TRỊ)

> **Lưu ý Phân quyền:** Tất cả các endpoint trong mục này đều yêu cầu Header:  
> `Authorization: Bearer <access_token>`

---

### 5.1 Xác thực Admin (Auth JWT & Cookies)

#### `POST /api/v1/admin/auth/login`
- **Request Body:**
```json
{
  "email": "admin@bmsolar.vn",
  "password": "Admin@123456"
}
```
- **Phản hồi Thành công (`200 OK`):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr_super_admin",
      "email": "admin@bmsolar.vn",
      "displayName": "BM SOLAR Super Admin",
      "branchId": null,
      "roles": ["super_admin"],
      "permissions": ["*"]
    }
  }
}
```
> Đồng thời backend sẽ tự động thiết lập Cookie `refresh_token` (`HttpOnly`, `SameSite=Strict`, `Secure=true`).

#### `POST /api/v1/admin/auth/refresh`
- **Mô tả:** Làm tươi `accessToken` khi token cũ sắp hết hạn (dùng Refresh Token trong Cookie hoặc Header).

#### `POST /api/v1/admin/auth/logout`
- **Mô tả:** Hủy phiên làm việc và xóa Cookie `refresh_token`.

#### `GET /api/v1/admin/auth/me`
- **Mô tả:** Lấy thông tin tài khoản đang đăng nhập, danh sách quyền (`permissions`), và chi nhánh phụ trách.

---

### 5.2 Quản trị Giao diện (Theme, Site Settings, Navigation)

#### `GET /api/v1/admin/site-settings` | `PUT /api/v1/admin/site-settings`
- Cập nhật tên công ty, chi nhánh mặc định, cấu hình thanh tiện ích `utilityBar`, và chân trang `footer`.

#### `GET /api/v1/admin/theme` | `PUT /api/v1/admin/theme`
- **Request Body mẫu (Cập nhật màu sắc thương hiệu):**
```json
{
  "primaryHex": "#0D4EA6",
  "navyHex": "#0D2E63",
  "accentHex": "#FF6B19",
  "fontsToken": "inter",
  "radiusToken": "md"
}
```

#### Quản lý Chi nhánh:
- `GET /api/v1/admin/branches`
- `POST /api/v1/admin/branches` (Tạo chi nhánh mới)
- `PUT /api/v1/admin/branches/:id` (Sửa chi nhánh)
- `DELETE /api/v1/admin/branches/:id` (Xóa chi nhánh)

#### Quản lý Menu Điều hướng:
- `GET /api/v1/admin/navigation`
- `POST /api/v1/admin/navigation/items` (Tạo mục menu, hỗ trợ phân cấp cha/con tối đa 3 cấp)
- `PUT /api/v1/admin/navigation/items/:id`
- `DELETE /api/v1/admin/navigation/items/:id`

---

### 5.3 Quản trị Xuất bản Trang CMS (Revisions & Publish)

#### `GET /api/v1/admin/pages`
- Danh sách trang CMS kèm trạng thái xuất bản (`draft`, `published`, `archived`).

#### `POST /api/v1/admin/pages`
- **Tạo trang mới:**
```json
{
  "pageKey": "chinh-sach-bao-hanh",
  "routeSlug": "chinh-sach-bao-hanh",
  "title": "Chính Sách Bảo Hành & Bảo Trì 25 Năm",
  "blocksJson": "[{\"id\":\"blk_1\",\"type\":\"richText\",\"version\":1,\"enabled\":true,\"sortOrder\":1,\"visibility\":\"all\",\"data\":{\"htmlSanitized\":\"<p>Chính sách bảo hành...</p>\"}}]"
}
```

#### `POST /api/v1/admin/pages/:id/publish`
- **Mô tả:** Kích hoạt xuất bản nguyên tử (Atomic Publish). Đưa bản nháp hiện tại thành bản chính thức hiển thị ngoài trang chủ, tự động cập nhật ETag.

#### `POST /api/v1/admin/pages/:id/unpublish`
- **Mô tả:** Hủy xuất bản trang. Trang sẽ bị ẩn khỏi Public API (trả về 404).

#### `GET /api/v1/admin/pages/:id/revisions`
- **Mô tả:** Xem lịch sử các phiên bản sửa đổi (Revision snapshots bất biến).

#### `POST /api/v1/admin/pages/:id/restore/:revisionNo`
- **Mô tả:** Quay lui nội dung về một phiên bản lịch sử mong muốn.

---

### 5.4 Quản trị Danh mục & Sản phẩm

#### Quản lý Danh mục:
- `GET /api/v1/admin/product-categories`
- `POST /api/v1/admin/product-categories`
```json
{
  "name": "Dây Cáp Điện DC Solar",
  "description": "Cáp đồng tráng thiếc chống cháy tiêu chuẩn IEC"
}
```
*(Backend tự động sinh slug tiếng Việt không dấu: `day-cap-dien-dc-solar`)*.

#### Quản lý Sản phẩm:
- `GET /api/v1/admin/products` (Hỗ trợ tìm kiếm, lọc theo trạng thái, danh mục).
- `POST /api/v1/admin/products`:
```json
{
  "sku": "INV-GROWATT-MIN-5K",
  "name": "Biến Tần Growatt MIN 5000TL-X 1 Pha 5kW",
  "categoryId": "cat_inverter_id",
  "brandId": "br_growatt_id",
  "summary": "Biến tần hòa lưới dân dụng thế hệ mới Growatt 5kW 1 pha...",
  "description": "<p>Nội dung giới thiệu chi tiết...</p>",
  "specificationJson": "{\"Công suất\": \"5000W\", \"Hiệu suất\": \"98.4%\"}"
}
```
- `POST /api/v1/admin/products/:id/publish` (Xuất bản sản phẩm).
- `POST /api/v1/admin/products/:id/unpublish` (Thu hồi về bản nháp).

---

### 5.5 Quản trị Dự án Tiêu biểu
- `GET /api/v1/admin/projects`
- `POST /api/v1/admin/projects`:
```json
{
  "title": "Dự Án Điện Mặt Trời Mái Nhà Xưởng Dệt May 300kWp",
  "projectTypeId": "pt_industrial_id",
  "provinceId": "prov_binh_duong_id",
  "summary": "Lắp đặt 550 tấm pin Jinko 550W...",
  "bodyJson": "{\"capacity\":\"300kWp\",\"inverter\":\"Huawei 100kW\"}"
}
```

---

### 5.6 Quản trị Tin tức & Bài viết
- `GET /api/v1/admin/articles`
- `POST /api/v1/admin/articles`:
```json
{
  "title": "Hướng Dẫn Thủ Tục Đấu Nối Điện Mặt Trời Mái Nhà 2026",
  "excerpt": "Cập nhật các quy định mới nhất về hồ sơ pháp lý điện áp mái tự sản tự tiêu...",
  "bodyJson": "{\"sections\":[{\"title\":\"Quy trình 3 bước\",\"content\":\"...\"}]}"
}
```

---

### 5.7 Quản trị CRM Leads & Máy Trạng thái

#### `GET /api/v1/admin/leads`
- **Mô tả:** Danh sách leads tư vấn.
- **Bảo mật Chi nhánh:** Trưởng chi nhánh hoặc nhân viên Gò Vấp sẽ **chỉ thấy** các lead của chi nhánh Gò Vấp. Super Admin thấy toàn bộ.
- **Query Params:** `status`, `branchId`, `page`, `pageSize`.

#### `POST /api/v1/admin/leads/:id/assign`
- **Phân công chuyên viên xử lý:**
```json
{
  "assigneeId": "usr_sales_hcm_id"
}
```

#### `POST /api/v1/admin/leads/:id/transition` (Chuyển đổi trạng thái)
- **Quy tắc máy trạng thái:**
  - `new` ➔ `contacted`
  - `contacted` ➔ `qualified`
  - `qualified` ➔ `quoted`
  - `quoted` ➔ `won`
  - Chuyển sang `lost` (thất bại) hoặc `invalid` (thông tin sai/ảo) từ bất kỳ bước nào, nhưng **bắt buộc phải có `reason`**.
- **Request Body mẫu (Chuyển sang contacted):**
```json
{
  "toStatus": "contacted",
  "note": "Đã gọi điện tư vấn hệ 5kW, khách hẹn thứ 7 khảo sát mái"
}
```
- **Request Body mẫu (Chuyển sang lost - Thất bại):**
```json
{
  "toStatus": "lost",
  "reason": "Khách hàng tạm hoãn kế hoạch xây nhà sang năm sau"
}
```

#### `GET /api/v1/admin/leads/:id/activities`
- **Mô tả:** Lấy toàn bộ timeline lịch sử của lead (Thời gian, người thao tác, trạng thái cũ/mới, ghi chú). Đây là dữ liệu bất biến (append-only).

---

### 5.8 Tự động hóa SEO & AI Draft

#### `POST /api/v1/admin/seo/generations`
- **Mô tả:** Tạo bản nháp SEO & bài viết gợi ý từ thông số kỹ thuật thực tế của một sản phẩm.
- **Request Body:**
```json
{
  "productId": "prod_deye_5kw_id"
}
```
- **Phản hồi:** Trả về bản nháp chứa tiêu đề đề xuất, mô tả chuẩn 150 ký tự, danh sách hashtags (`#BMSOLAR`, `#InverterHybrid`), và dàn ý bài viết kỹ thuật.

#### `POST /api/v1/admin/seo/generations/:id/review`
- **Mô tả:** Biên tập viên duyệt bản nháp SEO:
```json
{
  "approve": true
}
```

#### `POST /api/v1/admin/seo/generations/:id/convert-to-article`
- **Mô tả:** Chuyển đổi bản nháp SEO đã duyệt thành một bài viết tin tức chính thức (tạo ở trạng thái Draft để người quản trị kiểm tra lại trước khi xuất bản).

#### Quản lý Chuyển hướng 301 (Redirects):
- `GET /api/v1/admin/seo/redirects`
- `POST /api/v1/admin/seo/redirects`:
```json
{
  "sourcePath": "/san-pham-cu/inverter-deye-cu",
  "targetPath": "/san-pham/inverter-deye-hybrid-5kw",
  "httpStatus": 301
}
```

---

### 5.9 Upload Media Thư viện

#### `POST /api/v1/admin/media/upload`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `file`: Tệp hình ảnh hoặc tài liệu catalogue (PNG, JPG, WEBP, PDF).
  - `altText` (string, optional): Mô tả hình ảnh hỗ trợ SEO và Accessibility.
- **Phản hồi Thành công (`201 Created`):**
```json
{
  "data": {
    "id": "med_01M6RVG7...",
    "storageKey": "01M6RVG7...webp",
    "url": "http://localhost:3001/media/01M6RVG7...webp",
    "mimeType": "image/webp",
    "width": 1920,
    "height": 1080,
    "variants": [
      {
        "variantKey": "thumb_300",
        "url": "http://localhost:3001/media/01M6RVG7..._thumb_300.webp",
        "width": 300,
        "height": 168
      },
      {
        "variantKey": "medium_768",
        "url": "http://localhost:3001/media/01M6RVG7..._medium_768.webp",
        "width": 768,
        "height": 432
      }
    ]
  }
}
```

---

## 6. MÃ LỖI HỆ THỐNG & HƯỚNG XỬ LÝ PHÍA CLIENT

| Mã HTTP | Mã Error Code | Nguyên nhân thường gặp | Hướng xử lý phía Frontend |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | Thiếu trường bắt buộc hoặc sai định dạng dữ liệu (SĐT, Email, Hex color). | Đọc mảng `error.details` để hiển thị thông báo lỗi đỏ dưới từng ô input tương ứng. |
| `400` | `INVALID_JSON` | Payload gửi lên bị lỗi cú pháp JSON. | Kiểm tra `JSON.stringify` của request body. |
| `401` | `UNAUTHORIZED` | Chưa đăng nhập hoặc Access Token hết hạn / không hợp lệ. | Xóa token cũ trong client, tự động chuyển hướng người dùng về trang `/admin/login`. |
| `403` | `FORBIDDEN` | Tài khoản không có quyền thực hiện thao tác hoặc cố truy cập lead chi nhánh khác. | Hiển thị thông báo: "Bạn không có quyền truy cập vào tài nguyên này". |
| `404` | `NOT_FOUND` | Không tìm thấy trang, sản phẩm hoặc tài nguyên **chưa được xuất bản (Draft)**. | Render trang Giao diện 404 thân thiện. |
| `409` | `CONFLICT` | Trùng lặp mã định danh duy nhất (Slug đã tồn tại, Email đã có người đăng ký). | Thông báo cho người dùng đổi slug hoặc chọn tên khác. |
| `422` | `UNPROCESSABLE_ENTITY` | Vi phạm quy tắc nghiệp vụ (ví dụ: chuyển trạng thái lead sai quy trình, hoặc convert draft SEO chưa duyệt). | Hiển thị `error.message` trực tiếp qua toast notification. |
| `429` | `RATE_LIMIT_EXCEEDED` | Gửi quá nhiều request liên tiếp trong thời gian ngắn (chống spam form). | Khóa nút gửi trong 60 giây và đếm ngược hiển thị cho người dùng. |
| `500` | `INTERNAL_SERVER_ERROR` | Sự cố máy chủ ngoài dự kiến. | Hiển thị thông báo: "Hệ thống đang bảo trì, vui lòng thử lại sau" kèm `error.requestId` để báo kỹ thuật. |

