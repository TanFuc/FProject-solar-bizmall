# AGENTS.md — CHỈ DẪN NGHIÊM NGẶT DÀNH CHO AI CODING AGENT (GOLANG EDITION)

## Thứ tự ưu tiên (Hierarchy)
1. Bảo mật và Tính toàn vẹn dữ liệu (Security and Data Integrity)
2. `contracts/openapi.yaml` + Tài liệu thiết kế kiến trúc (`docs/`)
3. Kiểm thử chấp nhận (Acceptance Tests)
4. Sự tiện lợi trong triển khai (Implementation convenience)

## Các nguyên tắc không thỏa hiệp (Nonnegotiable)
- **Golang Strictness & No `any` shortcuts:**
  - Không sử dụng `any` hoặc `interface{}` bừa bãi trong các tầng Domain, Service, Repository và Public DTO. Mọi trường dữ liệu và payload đều phải có kiểu dữ liệu tường minh bằng Go struct.
  - Sử dụng `json.RawMessage` chỉ ở ranh giới (boundary) lưu trữ dynamic block data kèm theo parser/validator nghiêm ngặt theo discriminated union type.
  - Bắt buộc kiểm tra lỗi: Không được bỏ qua lỗi (`_ = err`). Mọi lỗi phát sinh phải được bọc context hoặc xử lý trả về theo chuẩn Error Envelope.
  - Sử dụng `github.com/go-playground/validator/v10` để kiểm tra tính hợp lệ của request payload ngay tại tầng Handler.
- **Không hardcode nội dung website:**
  - Tuyệt đối không hardcode text tiếng Việt, số hotline, đường dẫn Zalo, danh sách chi nhánh, menu điều hướng, nội dung banner, tiêu đề section hay thông số sản phẩm vào code Go. Toàn bộ phải được đọc từ database/CMS và cung cấp qua API.
  - Các hằng số nội bộ chỉ được phép là các mã kỹ thuật (vd: block type keys, permission strings, error codes).
- **Hợp đồng API (API-First Contract):**
  - Mọi endpoint public và admin phải khớp với tài liệu `contracts/openapi.yaml`.
  - Phản hồi lỗi phải tuân thủ đúng cấu trúc:
    `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...], "requestId": "..." } }`.
- **Phân quyền và Kiểm toán (RBAC & Audit):**
  - Mọi thao tác ghi/sửa/xóa nhạy cảm trong hệ thống Admin phải được kiểm tra quyền RBAC và ghi nhận log vào bảng `audit_logs`.
  - Không tin tưởng quyền từ Frontend gửi lên; luôn xác thực từ Claims trong JWT Token.
  - Dữ liệu chi nhánh phải được lọc scoped ở mức câu lệnh truy vấn database đối với nhân viên chi nhánh.
- **Bảo mật và Quyền riêng tư:**
  - Mật khẩu mã hóa bằng Argon2id hoặc Bcrypt với cost cao.
  - API Public không làm lộ thông tin bản nháp (drafts) hoặc thông tin cá nhân khách hàng (PII).
  - Không triển khai các tính năng e-commerce (giỏ hàng, thanh toán), microservices hay phụ thuộc bắt buộc vào AI trả phí.
- **Cam kết hoàn thành 12 Phase:**
  - Triển khai đầy đủ mã nguồn hoạt động thật (working code), không tạo hàm rỗng/mock/stub rồi đánh dấu hoàn thành.
  - Toàn bộ 12 Phase trong `docs/12-implementation-plan.md` phải có mã nguồn chạy được và test xác nhận.

## Thứ tự thực hiện (Execution Order)
1. Đọc kỹ tài liệu mô tả nghiệp vụ và kiến trúc liên quan.
2. Thiết kế Go struct, GORM model, và DTO tương ứng.
3. Cập nhật migration và repository interface.
4. Triển khai service nghiệp vụ kèm kiểm tra lỗi và audit log.
5. Triển khai HTTP Handler với Chi router và validation.
6. Viết test Unit / Integration bằng `go test` kiểm chứng kịch bản thành công và thất bại.
7. Cập nhật `contracts/openapi.yaml` đồng bộ.
