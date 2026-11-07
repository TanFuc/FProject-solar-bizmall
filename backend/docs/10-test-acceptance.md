# 10 — Ma trận Kiểm thử & Nghiệm thu Chất lượng (Testing & Acceptance Matrix - Golang)

Toàn bộ hệ thống kiểm thử được xây dựng bằng công cụ chuẩn của Golang (`go test`), kết hợp với cơ sở dữ liệu in-memory SQLite thuần Go (`glebarez/sqlite`) để các bài test có thể chạy độc lập, siêu tốc (dưới vài giây) mà không cần phụ thuộc vào dịch vụ bên ngoài, đồng thời hỗ trợ kiểm thử tích hợp trên MariaDB thật trong môi trường CI.

---

## 1. Kiểm thử Đơn vị (Unit Tests)

| Hạng mục kiểm thử | Tập tin kiểm thử tương ứng | Điều kiện nghiệm thu |
|---|---|---|
| **Chuẩn hóa Slug Tiếng Việt** | `internal/modules/seo/service/slug_test.go` | Xóa sạch dấu tiếng Việt (`á`, `ơ`, `đ`...), xử lý ký tự lạ, cắt gọt dấu gạch ngang, đảm bảo không lỗi runtime. |
| **Kiểm tra Content Block** | `internal/modules/cms/service/block_validator_test.go` | Kiểm tra đúng kiểu schema cho từng loại block (`heroCarousel`, `featureHighlights`...); từ chối JSON dị tật. |
| **Mã hóa Mật khẩu Argon2id** | `internal/modules/identity/service/hasher_test.go` | Sinh hash ngẫu nhiên với salt an toàn; xác thực chính xác mật khẩu đúng; từ chối mật khẩu sai. |
| **Máy Trạng thái Lead** | `internal/modules/leads/service/state_machine_test.go` | Chỉ cho phép các bước chuyển trạng thái hợp lệ (`new -> assigned -> contacted`...); chặn các bước nhảy cóc vô lý; yêu cầu lý do khi `lost`/`invalid`. |
| **Chuẩn hóa Số Điện thoại** | `internal/common/validator/phone_test.go` | Chuyển đổi chính xác các định dạng SĐT Việt Nam (`0912...`, `84912...`, `+84912...`) về chuẩn quốc tế E.164. |
| **Cơ chế Phân quyền RBAC** | `internal/modules/identity/service/rbac_test.go` | Kiểm tra ma trận quyền: Cho phép người có quyền truy cập, chặn ngay các hành vi vượt quyền với mã lỗi 403 Forbidden. |

---

## 2. Kiểm thử Tích hợp Cơ sở Dữ liệu (Integration Tests)

| Kịch bản kiểm thử | Hành vi kỳ vọng |
|---|---|
| **Xuất bản Trang Nguyên tử (Atomic Publish)** | Mở transaction, cập nhật `published_revision_id`, ghi nhận `audit_logs`. Nếu có lỗi xảy ra ở bất kỳ bước nào, toàn bộ transaction được rollback, trạng thái xuất bản không bị rò rỉ. |
| **Ràng buộc Duy nhất (Unique Constraints)** | Thử tạo 2 sản phẩm trùng slug hoặc 2 người dùng trùng email -> Bắt lỗi conflict 409 chính xác, không làm sập tiến trình Go. |
| **Kiểm tra Idempotency Lead** | Gửi 2 request tạo lead cùng lúc với cùng `Idempotency-Key` -> Chỉ có 1 bản ghi duy nhất được tạo trong database; request thứ 2 nhận lại response 201 tương đương. |
| **Phân quyền Dữ liệu Chi nhánh** | Tài khoản chuyên viên chi nhánh A truy vấn danh sách lead -> Cơ sở dữ liệu chỉ trả về lead của chi nhánh A, hoàn toàn không thấy dữ liệu của chi nhánh B. |
| **Tính Bất biến của Timeline (Append-Only)** | Thử thực thi thao tác xóa/sửa trên bảng `lead_activities` -> Bị từ chối tại tầng repository; mọi thay đổi trạng thái đều sinh thêm dòng mới kèm mốc thời gian chính xác. |

---

## 3. Kiểm thử Đầu cuối Toàn diện (End-to-End API Scenarios)

Sử dụng `httptest.Server` của Go để khởi chạy toàn bộ router Chi và kiểm tra luồng nghiệp vụ thực tế từ đầu đến cuối:

| Mã kịch bản | Luồng hành động E2E | Kết quả nghiệm thu |
|---|---|---|
| **E2E-001** | Khách truy cập `GET /api/v1/public/site-shell` | Nhận đầy đủ cấu hình thương hiệu, theme tokens, menu điều hướng, footer và danh sách chi nhánh hoạt động. |
| **E2E-002** | Khách chọn chi nhánh Gò Vấp `GET /api/v1/public/branches/:id/channels` | Nhận số hotline và link Zalo đã được gán riêng cho chi nhánh Gò Vấp; không xuất hiện thông tin mặc định nếu chi nhánh đã có cấu hình riêng. |
| **E2E-003** | Khách gửi form tư vấn `POST /api/v1/public/leads` kèm `Idempotency-Key` | Nhận mã `refCode` duy nhất; Lead lưu thành công với trạng thái `new`; tự động sinh hoạt động khởi tạo trong timeline. |
| **E2E-004** | Gửi lại cùng request ở E2E-003 | Nhận lại kết quả tương tự, không sinh thêm bản ghi lead thứ hai. |
| **E2E-005** | Quản trị viên đăng nhập `POST /api/v1/admin/auth/login` | Nhận JWT Access Token hợp lệ và Refresh Token. |
| **E2E-006** | Nhân viên kinh doanh chuyển trạng thái lead sang `contacted` | Lead cập nhật thành công; timeline bổ sung một activity loại `status_changed`. |
| **E2E-007** | Biên tập viên tạo trang mới và xuất bản | Trang xuất hiện trên `GET /api/v1/public/pages/:key`; trước khi xuất bản, trang chỉ trả về 404 trên public API. |
| **E2E-008** | Truy cập `GET /api/v1/public/sitemap.xml` | Tệp XML sitemap chứa đầy đủ URL các trang và sản phẩm đã xuất bản, loại trừ toàn bộ bản nháp. |

---

## 4. Lệnh Thực thi Kiểm thử
```bash
# Chạy toàn bộ test suite
go test ./... -v

# Chạy test kiểm tra race condition (Data race detector của Go)
go test -race ./...

# Chạy test đo lường độ bao phủ mã nguồn (Coverage)
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```
Tiêu chuẩn chấp thuận (Acceptance Gate): Mọi bài test phải PASS 100%, không phát hiện Data Race, độ bao phủ logic nghiệp vụ cốt lõi đạt trên 80%.
