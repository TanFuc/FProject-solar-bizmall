# 03 — Architecture Decisions (ADRs) — Golang Modular Monolith

## ADR-001 Modular Monolith in Golang
Chuyển đổi kiến trúc sang **Golang Modular Monolith** với HTTP Router Chi (`net/http` tương thích 100%), GORM persistence, ULID 26-char IDs, và các isolated domain packages. Một deployable binary duy nhất + MariaDB (hoặc Pure-Go SQLite cho testing/local dev). Không phụ thuộc NestJS hay Node.js runtime.

```text
Client FE (Next.js / Nuxt / Astro) / Admin CMS
     | HTTPS /api/v1
API Gateway / Reverse Proxy / TLS
     |
Golang Monolith (bmsolar-server)
  ├─ Middleware: RequestID, ClientIP Hashing, Slog Structured Logger, Recovery, CORS
  ├─ Identity Module (Argon2id, JWT Access & Refresh, RBAC Guards, User CRUD)
  ├─ Media Module (Storage Engine, Dimensions Extraction, Responsive Variants)
  ├─ CMS Shell Module (Site Settings, Theme Tokens, Navigation Tree, Branch Resolution)
  ├─ CMS Publishing Engine (Pages, Immutable Revisions, Discriminated Block Registry)
  ├─ Catalog Module (Categories Tree, Brands, Audiences, Products, Specs JSON)
  ├─ Projects Module (Project Types, Provinces, Project Gallery Showcase)
  ├─ Editorial Module (News Articles, Tags, Content Associations)
  ├─ Leads CRM Module (Idempotency Key, Bot Protection, Branch Scoping, State Machine)
  ├─ Seo Module (Vietnamese Slugifier, Dynamic sitemap.xml, 301 Redirects, Drafts)
  └─ Database Layer (MariaDB 11.4 / SQLite pure-Go, Connection Pool, Outbox Events)
```

## Module boundaries
- **Handlers:** Tiếp nhận HTTP requests, parse DTOs, validate payload, kiểm tra quyền RBAC qua middleware, ủy quyền nghiệp vụ và trả về typed JSON envelope.
- **Data Access:** Models định nghĩa struct GORM với strict tags, foreign keys, unique indexes.
- **Transactions & Concurrency:** Sử dụng `db.Transaction(func(tx *gorm.DB) error { ... })` đảm bảo tính nguyên tử tuyệt đối (ví dụ: xuất bản trang chuyển `published_revision_id`, tạo lead kèm activity timeline và outbox event).
- **Public Read Isolation:** Đường dẫn công khai (`/public/*`) chỉ truy vấn các bản ghi có trạng thái `published` (hoặc `active`), loại bỏ hoàn toàn nguy cơ rò rỉ bản nháp (`draft`) hoặc thông tin PII.

## Error contract
Mọi phản hồi lỗi đều tuân thủ cấu trúc chuẩn:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'name' is required",
    "details": {},
    "requestId": "01J...ULID"
  }
}
```
Mã trạng thái HTTP:
- `400 Bad Request`: Sai cú pháp request, thiếu trường bắt buộc
- `401 Unauthorized`: Chưa đăng nhập hoặc token hết hạn
- `403 Forbidden`: Không đủ quyền RBAC hoặc truy cập dữ liệu chi nhánh khác
- `404 Not Found`: Không tìm thấy tài nguyên hoặc tài nguyên chưa xuất bản
- `409 Conflict`: Trùng mã SKU, slug hoặc xung đột phiên bản
- `422 Unprocessable Entity`: Dữ liệu đúng định dạng nhưng vi phạm quy tắc nghiệp vụ (ví dụ: chuyển trạng thái lead không hợp lệ, chuyển đổi bản nháp SEO chưa được duyệt)
- `429 Too Many Requests`: Vượt quá giới hạn tần suất gửi form/request
- `500 Internal Server Error`: Lỗi hệ thống bất ngờ (đã ẩn chi tiết nội bộ)
