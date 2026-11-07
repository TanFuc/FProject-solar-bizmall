# BM SOLAR — Backend Engineering Blueprint v1.0 (Golang Architecture)

**Status:** Implementation Complete. **Ngày:** 2026-11-06. **UI reference:** `reference/ui-reference.png`.

## Mục tiêu & Ngôn ngữ triển khai
Backend API-first, CMS-driven, độc lập hoàn toàn với frontend; toàn bộ dữ liệu hiển thị từ CMS/API (không hardcode copy, URL, hotline, menu, màu sắc thương hiệu, sections, banners, products, categories, projects, branches). Hỗ trợ cấu hình riêng desktop/mobile, SEO server-rendered ở frontend, và tiếp nhận lead CRM có lịch sử bảo mật.

**Technology Stack:**
- **Language:** Golang 1.24+ (Strict typing, no `any` abuse, zero memory overhead, high throughput)
- **HTTP Engine:** Go-Chi (`github.com/go-chi/chi/v5`) lightweight, idiomatic net/http
- **Database:** MariaDB / MySQL (production) & Pure-Go SQLite CGO-free (`github.com/glebarez/sqlite` / `modernc.org/sqlite`) for zero-dependency local dev and instant unit/integration testing
- **ORM & Migrations:** GORM (`gorm.io/gorm`) with transaction outbox and atomic revisions
- **Identifiers:** ULID CHAR(26) (`github.com/oklog/ulid/v2`) sortable, URL-safe
- **Auth & Passwords:** Argon2id (`golang.org/x/crypto/argon2`) + JWT Access & Refresh (`github.com/golang-jwt/jwt/v5`)
- **API Spec:** OpenAPI 3.1 (`contracts/openapi.yaml`)
- **Storage:** Local filesystem storage & MinIO/S3 compatible
- **Testing:** Native Go test runner with httptest (`go test -v ./test/...`)
- **Containerization:** Multi-stage minimal Alpine Dockerfile & Docker Compose

## Cấu trúc thư mục chuẩn (Go Standard Layout)
```text
backend/
├── cmd/
│   ├── server/main.go          # HTTP API Server bootstrapper & graceful shutdown
│   └── seed/main.go            # Database seeder CLI (branches, catalog, blocks, accounts)
├── internal/
│   ├── common/
│   │   ├── errors/             # Typed error envelope { error: { code, message, requestId } }
│   │   ├── id/                 # 26-char ULID generator
│   │   ├── middleware/         # RequestID, structured slog logger, CORS, recovery
│   │   ├── pagination/         # Strict pagination (max 50, default 12)
│   │   └── slug/               # Vietnamese diacritics slugifier & transliterator
│   ├── config/                 # Environment variables loader
│   ├── database/
│   │   ├── models/             # 24 relational GORM models & foreign key constraints
│   │   ├── seed/               # Complete domain seeding logic
│   │   └── db.go               # DB connection pool & automigrations
│   └── modules/
│       ├── identity/           # Argon2id, JWT, User CRUD, Roles, Permissions RBAC
│       ├── media/              # Media upload, variant generation, public streaming
│       ├── cms/                # Site shell, theme tokens, navigation, pages publishing
│       ├── catalog/            # Categories, brands, products, specifications JSON
│       ├── projects/           # Project types, provinces, projects gallery
│       ├── editorial/          # News articles, tags, knowledge base
│       ├── leads/              # Lead capture, idempotency, branch routing, state machine
│       └── seo/                # Dynamic sitemap.xml, 301 redirects, deterministic SEO
├── contracts/
│   └── openapi.yaml            # OpenAPI 3.1 fully expanded contract
├── docs/                       # 12 Architecture, domain, and acceptance documents
└── test/
    ├── unit_test.go            # Unit tests (slug, phone/zalo, pagination, blocks)
    └── e2e_test.go             # E2E integration tests (all 12 phases passing)
```

## Hướng dẫn chạy nhanh (Quickstart)

### 1. Chạy Tests
```bash
go test -v ./test/...
```

### 2. Nạp dữ liệu mẫu (Seed Data)
```bash
go run ./cmd/seed
```
Tạo sẵn tài khoản quản trị:
- **Email:** `admin@bmsolar.vn`
- **Mật khẩu:** `Admin@123456`

Tài khoản nhân viên kinh doanh HCM:
- **Email:** `sales.hcm@bmsolar.vn`
- **Mật khẩu:** `Sales@123456`

### 3. Khởi động Backend API
```bash
go run ./cmd/server
```
API server chạy tại `http://localhost:3001`.
- Live Probe: `GET http://localhost:3001/health/live`
- Ready Probe: `GET http://localhost:3001/health/ready`
- Public Site Shell: `GET http://localhost:3001/api/v1/public/site-shell`
- Public Homepage: `GET http://localhost:3001/api/v1/public/pages/home`
- Dynamic Sitemap: `GET http://localhost:3001/api/v1/public/sitemap.xml`

### 4. Build nhị phân (Binary Build)
```bash
go build -o bmsolar-server.exe ./cmd/server
```
