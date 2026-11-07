# 05 — Đặc tả Hợp đồng API (API Contract Specification - REST v1)

> **Tài liệu Chi tiết Tích hợp Toàn diện:** Xem cẩm nang đầy đủ dành riêng cho Frontend tại [`API_DOCUMENTATION.md`](file:///c:/Users/Local_2/OneDrive/Desktop/Project-NEW/FProject-solar-bizmall/backend/docs/API_DOCUMENTATION.md) (bao gồm toàn bộ Request/Response payload, Form Data, TypeScript types và mã lỗi).

Base URL: `/api/v1`  
Định dạng: JSON UTF-8, Thời gian: chuẩn ISO-8601 / RFC3339 UTC (`2026-11-06T16:00:00Z`).  
Mọi trường dữ liệu JSON sử dụng chuẩn `camelCase`, tham số query URL sử dụng `camelCase` có mapping rõ ràng.

---

## 1. Danh sách Endpoints Public (Không yêu cầu xác thực)

| Phương thức | Đường dẫn API | Mục đích nghiệp vụ | Headers đặc biệt |
|---|---|---|---|
| `GET` | `/health/live` | Kubernetes / Docker liveness probe | Không |
| `GET` | `/health/ready` | Readiness probe (kiểm tra kết nối MariaDB và Storage) | Không |
| `GET` | `/media/{key}` | Phân phối tệp hình ảnh / tài liệu tĩnh | Không |
| `GET` | `/public/site-shell` | Khung website: thương hiệu, theme tokens, menu, footer, kênh liên hệ chung, 5 nút mobile bar | Không |
| `GET` | `/public/branches` | Danh sách các chi nhánh đang hoạt động (`?active=true`) | Không |
| `GET` | `/public/branches/{id}/channels` | Phân giải kênh liên hệ (hotline, Zalo, email) theo chi nhánh (kèm fallback toàn quốc) | Không |
| `GET` | `/public/pages/{pageKey}` | Nội dung trang CMS đã xuất bản (`home`, `about`, `solutions`, `contact`) kèm ETag | `If-None-Match` (304) |
| `GET` | `/public/audiences` | Danh sách nhóm đối tượng khách hàng (`household`, `business`, `industrial`) | Không |
| `GET` | `/public/product-categories` | Cây danh mục sản phẩm thiết bị năng lượng mặt trời | Không |
| `GET` | `/public/products` | Danh sách sản phẩm có phân trang, lọc theo category, brand, audience | Không |
| `GET` | `/public/products/{slug}` | Chi tiết sản phẩm, thư viện ảnh và thông số kỹ thuật thực tế | Không |
| `GET` | `/public/project-types` | Danh sách loại hình dự án | Không |
| `GET` | `/public/provinces` | Danh sách tỉnh thành thi công | Không |
| `GET` | `/public/projects` | Danh sách dự án tiêu biểu có phân trang và bộ lọc | Không |
| `GET` | `/public/projects/{slug}` | Chi tiết dự án thực tế | Không |
| `GET` | `/public/articles` | Danh sách bài viết tin tức, cẩm nang | Không |
| `GET` | `/public/articles/{slug}` | Chi tiết bài viết | Không |
| `GET` | `/public/tags/{slug}` | Danh sách nội dung liên quan theo hashtag | Không |
| `POST` | `/public/leads` | Khách gửi form yêu cầu tư vấn / báo giá | `Idempotency-Key` (Bắt buộc) |
| `GET` | `/public/sitemap.xml` | XML sitemap động phục vụ Googlebot và các công cụ tìm kiếm | Không |
| `GET` | `/public/seo/{entityKind}/{entityId}` | Lấy metadata SEO đã xuất bản của một thực thể | Không |
| `GET` | `/public/redirects/resolve` | Tra cứu chuyển hướng 301 khi thay đổi URL | Không |

---

## 2. Danh sách Endpoints Admin (Yêu cầu JWT Bearer & RBAC Permission)

> **Mọi request Admin đều yêu cầu:** `Authorization: Bearer <access_token>`

### Nhóm Xác thực & Quản trị Hệ thống
- `POST /admin/auth/login`: Đăng nhập cấp phát Access Token (JWT) & Refresh Token Cookie.
- `POST /admin/auth/refresh`: Làm tươi Access Token.
- `POST /admin/auth/logout`: Đăng xuất và vô hiệu hóa phiên.
- `GET /admin/auth/me`: Lấy thông tin tài khoản đang đăng nhập, quyền hạn và chi nhánh phụ trách.
- `GET /admin/users`, `POST /admin/users`: Quản lý người dùng nội bộ.
- `GET /admin/roles`, `GET /admin/permissions`: Quản lý vai trò và ma trận quyền RBAC.

### Nhóm Quản trị Giao diện & Cấu hình Website (CMS Shell)
- `GET /admin/site-settings`, `PUT /admin/site-settings`: Cấu hình thanh tiện ích, chi nhánh mặc định, footer.
- `GET /admin/theme`, `PUT /admin/theme`: Chỉnh sửa màu thương hiệu (`#0D4EA6`, `#0D2E63`, `#FF6B19`), font, radius design tokens.
- `GET /admin/branches`, `POST /admin/branches`, `PUT /admin/branches/{id}`, `DELETE /admin/branches/{id}`: Quản lý chi nhánh.
- `GET /admin/contact-channels`, `POST /admin/contact-channels`, `PUT /admin/contact-channels/{id}`, `DELETE /admin/contact-channels/{id}`: Quản lý hotline/Zalo.
- `GET /admin/navigation`, `POST /admin/navigation/items`, `PUT /admin/navigation/items/{id}`, `DELETE /admin/navigation/items/{id}`: Quản lý menu.

### Nhóm Trang CMS & Xuất bản (Pages & Publishing Lifecycle)
- `GET /admin/pages`: Danh sách trang CMS.
- `POST /admin/pages`: Tạo trang mới.
- `GET /admin/pages/{id}`, `PUT /admin/pages/{id}`: Lấy thông tin trang và cập nhật bản nháp.
- `POST /admin/pages/{id}/revisions`: Lưu phiên bản sửa đổi (Revision snapshot).
- `POST /admin/pages/{id}/publish`: Xuất bản nguyên tử (Atomic Publish).
- `POST /admin/pages/{id}/unpublish`: Hủy xuất bản (trả về 404 cho Public API).
- `GET /admin/pages/{id}/revisions`: Xem lịch sử các phiên bản sửa đổi.
- `POST /admin/pages/{id}/restore/{revisionNo}`: Quay lui về một phiên bản lịch sử cũ.
- `GET /admin/pages/{id}/preview-token`: Sinh token bảo mật để xem trước bản nháp.

### Nhóm Danh mục & Dự án & Tin tức (Catalog, Projects, Editorial)
- CRUD `/admin/product-categories`: Quản lý danh mục sản phẩm (tự động sinh slug tiếng Việt).
- CRUD `/admin/brands`: Quản lý thương hiệu ủy quyền (Deye, Huawei, Jinko).
- CRUD `/admin/products`: Quản lý sản phẩm thiết bị, thông số kỹ thuật động, thư viện ảnh.
- `POST /admin/products/{id}/publish`, `POST /admin/products/{id}/unpublish`: Đổi trạng thái sản phẩm.
- CRUD `/admin/project-types`, CRUD `/admin/provinces`, CRUD `/admin/projects`: Quản trị dự án tiêu biểu.
- CRUD `/admin/tags`, CRUD `/admin/articles`: Quản trị tin tức, cẩm nang và gắn thẻ.

### Nhóm Quản lý Khách hàng Tiềm năng (Leads CRM)
- `GET /admin/leads`: Danh sách leads có phân trang (scoped theo chi nhánh của tài khoản đăng nhập).
- `GET /admin/leads/{id}`: Chi tiết thông tin lead.
- `POST /admin/leads/{id}/assign`: Phân công chuyên viên kinh doanh xử lý.
- `POST /admin/leads/{id}/transition`: Chuyển đổi trạng thái (`contacted`, `qualified`, `quoted`, `won`, `lost`, `invalid` — bắt buộc có `reason` khi lost/invalid).
- `GET /admin/leads/{id}/activities`: Lấy toàn bộ timeline lịch sử bất biến của lead.

### Nhóm Tự động hóa SEO & AI Draft
- `POST /admin/seo/generations`: Tạo bản nháp SEO & bài viết gợi ý từ thông số kỹ thuật thực tế của sản phẩm.
- `GET /admin/seo/generations/{id}`: Xem nội dung draft gợi ý.
- `POST /admin/seo/generations/{id}/review`: Duyệt bản nháp SEO (`approve: true`).
- `POST /admin/seo/generations/{id}/convert-to-article`: Chuyển đổi bản nháp đã duyệt thành bài viết tin tức (trạng thái Draft).
- `GET /admin/seo/redirects`, `POST /admin/seo/redirects`: Quản lý danh sách URL redirect 301.

### Nhóm Quản lý Media Thư viện
- `POST /admin/media/upload`: Tải lên hình ảnh/tài liệu qua `multipart/form-data`, tự động sinh 5 biến thể responsive.
- `GET /admin/media`: Duyệt thư viện hình ảnh và tài liệu.
- `GET /admin/media/{id}`: Xem chi tiết asset và các biến thể kích thước.

---

## 3. Cấu trúc Phản hồi Chuẩn

### Phản hồi Danh sách có Phân trang:
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

### Phản hồi Lỗi chuẩn (Error Envelope):
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
