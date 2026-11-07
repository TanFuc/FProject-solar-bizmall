# 09 — DevOps, Configuration & Observability (Golang)

## Local Setup & Commands
- **Go Version:** Go 1.24+ (hỗ trợ go1.24, go1.25, go1.27)
- **Tải dependencies:**
  ```bash
  go mod download
  ```
- **Chạy Tests:**
  ```bash
  go test -v ./test/...
  ```
- **Nạp dữ liệu hạt giống (Seed Database):**
  ```bash
  go run ./cmd/seed
  ```
- **Chạy ứng dụng Local Dev:**
  ```bash
  go run ./cmd/server
  ```
- **Build binary độc lập:**
  ```bash
  go build -ldflags="-w -s" -o bmsolar-server.exe ./cmd/server
  ```

## Môi trường cấu hình (.env)
- `PORT`: Cổng lắng nghe HTTP (mặc định: `3001`)
- `APP_ENV`: Môi trường (`development`, `production`, `test`)
- `DATABASE_URL`: Chuỗi kết nối CSDL (hỗ trợ `mysql://user:pass@tcp(host:3306)/dbname` hoặc `sqlite://bmsolar.db`)
- `APP_BASE_URL`: URL gốc của backend API (mặc định: `http://localhost:3001`)
- `WEB_PUBLIC_URL`: URL trang web công khai (mặc định: `http://localhost:3000`)
- `CORS_ALLOWED_ORIGINS`: Danh sách domain frontend được phép gọi API (phân cách bằng dấu phẩy)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Khóa bí mật ký JWT (tối thiểu 32 ký tự)
- `STORAGE_DIR`: Thư mục lưu trữ media assets (mặc định: `./uploads`)
- `LOG_LEVEL`: Mức độ log (`debug`, `info`, `warn`, `error`)

## Docker Multi-stage Deployment
File `Dockerfile` xây dựng qua 2 stages:
1. `golang:1.24-alpine` builder biên dịch tĩnh binary CGO_ENABLED=0
2. `alpine:3.21` runner nhẹ (<30MB), chạy dưới quyền user không đặc quyền `bmsolar`

Khởi chạy trọn gói bằng Docker Compose:
```bash
docker compose up -d
```

## Giám sát & Health Probes
- `GET /health/live`: Probe kiểm tra tiến trình đang chạy (không phụ thuộc CSDL bên ngoài).
- `GET /health/ready`: Probe kiểm tra kết nối CSDL và tài nguyên lưu trữ sẵn sàng nhận traffic.
- **Structured Logging:** Sử dụng thư viện chuẩn `log/slog` định dạng JSON có đính kèm `requestId`, `method`, `path`, `status`, `duration_ms`.
