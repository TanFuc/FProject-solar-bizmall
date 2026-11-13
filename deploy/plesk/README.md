# BM SOLAR trên Plesk Linux x86_64

Gói gồm Next.js standalone cho Node.js 22, API Go Linux và mẫu cấu hình. Gói không chứa database, thư viện media, log hoặc thông tin xác thực. Cài Node.js Toolkit và chuẩn bị quyền SSH quản trị để chạy API qua systemd.

1. Giải nén phần `frontend` vào thư mục ứng dụng Node.js của subscription. Trong Plesk chọn Node.js 22, Production, Application Root là thư mục đó, Document Root là thư mục con `public`, Application Startup File là `app.cjs`. Đặt biến `BMSOLAR_BACKEND_URL=http://127.0.0.1:3001`. Gói đã có dependency runtime.
2. Đặt thư mục `backend` ngoài Document Root. Đặt database đã được duyệt và thư mục lưu trữ mà user subscription có quyền ghi. Backend production không tự tạo tài khoản hoặc nội dung demo. Nếu chuyển dữ liệu local, hãy loại bỏ tài khoản mẫu và đổi mật khẩu quản trị trước khi mở website ra Internet. Bản dịch đã tạo nằm trong dữ liệu CMS và cần được chuyển cùng database.
3. Dùng `backend.env.example` tạo file môi trường riêng, thay domain, đường dẫn, biến R2 và hai JWT secret riêng biệt. Mẫu systemd dùng API loopback. Node.js chuyển tiếp yêu cầu API cùng domain.
4. Thay các placeholder trong `bmsolar.service`, cài vào systemd, chạy `systemctl daemon-reload` và `systemctl enable --now bmsolar`. Kiểm tra `curl -f http://127.0.0.1:3001/health/ready`, khởi động ứng dụng Node.js từ Plesk và thử đăng nhập, tải ảnh, đổi ngôn ngữ và xem sitemap.
5. Sao lưu database trước khi nâng cấp. Giữ bản build trước và snapshot database tương ứng để rollback.

Build lại trên Linux hoặc WSL2 với Node.js 22, npm và Go theo go.mod.

```bash
BMSOLAR_SITE_URL=https://solar.bizmallgroup.com BMSOLAR_SMOKE_DB=/absolute/path/to/snapshot.db bash scripts/build-plesk.sh
```

[Tài liệu Plesk Node.js](https://docs.plesk.com/en-US/obsidian/administrator-guide/website-management/nodejs-support.76652/)
