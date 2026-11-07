# FProject-solar-bizmall

> **BM SOLAR Web Platform** — Next.js 14 App Router + Golang Modular Monolith.
> Nền tảng thương mại và giải pháp điện mặt trời mái nhà B2B/B2C chuẩn Technical SEO, CMS-driven và đa ngôn ngữ (Tiếng Việt / English).

---

## 🏗️ Kiến Trúc Tổng Thể

- **Frontend (`/frontend`)**:
  - **Framework**: Next.js 14 App Router, React 18, TypeScript Strict (`strict: true`, 0 `any`).
  - **Styling**: Tailwind CSS với hệ thống Design Tokens tùy biến bám sát `BM_SOLAR_Full_Page_Designs`.
  - **Mobile UX**: Thanh điều hướng cố định 5 nút chuẩn hóa (*Trang chủ, Gọi ngay, Zalo, Tư vấn, Menu*) và Mobile Drawer tương tác.
  - **Technical SEO**: Schema.org JSON-LD (Organization, WebSite, LocalBusiness, Product, BlogPosting, Service), Sitemap động, Robots.txt, Pipeline xử lý hashtag tiếng Việt PascalCase.
  - **Internationalization (i18n)**: Đa ngôn ngữ đầy đủ (Tiếng Việt 🇻🇳 / English 🇬🇧) với 131 key dịch đồng bộ 100% parity và cơ chế chuyển đổi mượt mà.

- **Backend (`/backend`)**:
  - **Ngôn ngữ & Kiến trúc**: Golang Modular Monolith (Go 1.22+).
  - **CSDL & Cache**: MariaDB / SQLite + Redis Caching.
  - **Media Processing**: Pipeline tối ưu hóa hình ảnh đa kích thước (Thumb, Medium, Large) hỗ trợ Local Storage & Cloudflare R2.
  - **Bảo mật**: Argon2id Password Hashing, JWT Authentication, HMAC-SHA256 Webhook Verification, Rate Limiting & Concurrency Controls.

---

## 🚀 Khởi Chạy Nhanh

### 1. Khởi động Backend
```bash
cd backend
go run cmd/server/main.go
# Server lắng nghe tại http://localhost:3001
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
# Ứng dụng chạy tại http://localhost:3000
```

### 3. Kiểm thử tự động (Frontend)
```bash
cd frontend
npm run test:seo      # Kiểm thử SEO, Hashtag & HMAC Outbox
npm run test:matrix   # Kiểm thử 6 kịch bản End-to-End Test Matrix
npm run test:i18n     # Kiểm thử toàn vẹn hệ thống đa ngôn ngữ
npm run typecheck     # Kiểm tra TypeScript Strict
npm run build         # Build production bundle
```

---

## 📚 Tài Liệu Kỹ Thuật

- [PRODUCT.md](./PRODUCT.md) — Tổng quan sản phẩm & quy chuẩn nghiệp vụ.
- [DESIGN.md](./DESIGN.md) — Hệ thống Design System & Tokens.
- [backend/docs/API_DOCUMENTATION.md](./backend/docs/API_DOCUMENTATION.md) — Đặc tả toàn bộ API RESTful Backend.
- [frontend/docs/FINAL_HANDOFF_DOSSIER.md](./frontend/docs/FINAL_HANDOFF_DOSSIER.md) — Hồ sơ nghiệm thu & kết quả Visual QA.
