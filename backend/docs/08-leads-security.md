# 08 — CRM Quản lý Lead, Bảo mật & Quyền riêng tư (Golang)

## 1. Luồng Dữ liệu Tiếp nhận Lead (Lead Intake Flow)

```text
Khách gửi Form (Tên, SĐT, Nhu cầu, Đồng thuận riêng tư)
Header: Idempotency-Key
             │
             ▼
[Rate-Limit Middleware (Go)] ──► Chặn gửi ồ ạt (> 5 req/phút/IP)
             │
             ▼
[Spam & Honeypot Filter] ────► Phát hiện bot tự động điền form ẩn
             │
             ▼
[Idempotency Checker] ────────► Nếu cùng Key + Hash Payload: Trả về kết quả cũ ngay lập tức
             │
             ▼
[Mở DB Transaction]
 ├─ Chuẩn hóa Số điện thoại E.164 (VD: 0912345678 -> +84912345678)
 ├─ Sinh Mã tham chiếu duy nhất: RefCode (VD: BMS-202611-7890)
 ├─ Lưu bản ghi Lead (Trạng thái: "new", ghi nhận consentAt và privacyPolicyVersion)
 ├─ Điều phối chi nhánh tự động (dựa trên chi nhánh khách chọn hoặc vị trí)
 ├─ Ghi bản ghi Activity đầu tiên: kind = "created", actor = "visitor"
 └─ Commit Transaction
             │
             ▼
Trả về HTTP 201 Created: { data: { refCode: "...", status: "new" } }
```

---

## 2. Máy Trạng thái Lead (Lead State Machine trong Go)

```text
    ┌──────────┐
    │   new    │
    └────┬─────┘
         │ (Phân công chuyên viên)
         ▼
    ┌──────────┐
    │ assigned │
    └────┬─────┘
         │ (Đã liên hệ cuộc gọi đầu tiên)
         ▼
    ┌───────────┐
    │ contacted │
    └────┬──────┘
         │ (Khảo sát nhu cầu thực tế thành công)
         ▼
    ┌───────────┐
    │ qualified │
    └────┬──────┘
         │ (Gửi bảng báo giá chi tiết)
         ▼
    ┌──────────┐
    │  quoted  │
    └────┬─────┘
         ├─────────────────────────────┬─────────────────────────────┐
         │ (Ký hợp đồng thi công)       │ (Khách từ chối/hủy)         │ (Thông tin sai/ảo)
         ▼                             ▼                             ▼
    ┌──────────┐                  ┌──────────┐                  ┌───────────┐
    │   won    │                  │   lost   │                  │  invalid  │
    └──────────┘                  └──────────┘                  └───────────┘
```

### Nguyên tắc Chuyển đổi Trạng thái:
- Mọi thao tác chuyển trạng thái (`POST /admin/leads/:id/transition`) đều yêu cầu quyền `crm.lead.transition`.
- Khi chuyển sang `lost` hoặc `invalid`, bắt buộc phải cung cấp trường lý do (`reason`).
- **Lịch sử hoạt động bất biến (Append-Only Timeline):** Mỗi lần thay đổi trạng thái, phân công nhân sự, hoặc thêm ghi chú tư vấn, hệ thống tự động ghi một bản ghi vào bảng `lead_activities` chứa thời gian, người thực hiện (`actor_id`), trạng thái cũ và mới. Bảng này không có API xóa hoặc sửa, đảm bảo tính minh bạch tuyệt đối trong quy trình bán hàng.

---

## 3. Phân quyền Dữ liệu theo Chi nhánh (Branch-Scoped Authorization)
- **Super Admin & Giám đốc kinh doanh:** Xem và xử lý toàn bộ lead trên toàn quốc.
- **Trưởng chi nhánh (Branch Manager):** Chỉ xem và quản lý lead thuộc chi nhánh của mình (`WHERE branch_id = user.branch_id`).
- **Chuyên viên kinh doanh (Sales Agent):** Chỉ xem các lead được phân công trực tiếp cho mình (`WHERE assignee_id = user.id`) hoặc lead chưa có người tiếp nhận thuộc chi nhánh mình phụ trách.
- Logic lọc dữ liệu được cưỡng chế trực tiếp tại tầng Repository GORM thông qua scope/predicate SQL, không dựa vào việc ẩn/hiện nút trên giao diện Frontend.

---

## 4. Bảo mật Xác thực & Mật khẩu (Authentication & Cryptography)
- **Mã hóa Mật khẩu:** Sử dụng thuật toán **Argon2id** (`golang.org/x/crypto/argon2`) — tiêu chuẩn hiện đại nhất hiện nay với khả năng chống tấn công GPU/ASIC mạnh mẽ:
  - Memory: 64MB, Iterations: 3, Parallelism: 2, Salt ngẫu nhiên 16 bytes an toàn bằng `crypto/rand`.
- **JWT Token Management (`golang-jwt/jwt/v5`):**
  - **Access Token:** Hạn sử dụng ngắn (15 phút), chứa `user_id`, `role`, `branch_id`, danh sách `permissions`.
  - **Refresh Token:** Hạn sử dụng 7 ngày, lưu trữ an toàn trong HTTP-Only, Secure, SameSite Cookie hoặc gửi qua header có cơ chế thu hồi (Revocation / Session blacklist).
- **Phòng chống Tấn công:**
  - Chống Brute-force đăng nhập: Tự động khóa tạm thời IP/tài khoản sau 5 lần nhập sai liên tiếp.
  - Chống Mass Assignment: Sử dụng các Go DTO structs riêng biệt cho từng hành động tạo/sửa, không binding trực tiếp payload vào GORM model.
  - Che giấu Thông tin Cá nhân (PII Redaction): Logger hệ thống tự động ẩn các ký tự giữa của số điện thoại và email khách hàng (ví dụ: `091****678`, `ng***@gmail.com`) khi ghi log hoạt động.

---

## 5. Nhật ký Kiểm toán (Immutable Audit Logs)
Bảng `audit_logs` lưu trữ mọi hoạt động thay đổi cấu hình website, xuất bản nội dung, sửa thông tin hotline chi nhánh, thay đổi quyền hạn nhân viên và xuất dữ liệu báo cáo:
- `actor_id`: Người thực hiện (kèm email).
- `action`: Loại hành động (ví dụ: `BRANCH_CONTACT_UPDATED`, `ROLE_PERMISSION_CHANGED`, `LEAD_STATUS_TRANSITIONED`).
- `entity_type` & `entity_id`: Thực thể chịu tác động.
- `old_value` & `new_value`: Dữ liệu trước và sau thay đổi (đã được lọc bỏ mật khẩu và thông tin thẻ nhạy cảm).
- `ip_hash`: Hash SHA-256 địa chỉ IP của người thao tác phục vụ đối soát an ninh.
