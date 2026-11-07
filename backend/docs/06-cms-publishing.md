# 06 — Admin CMS & Chu trình Xuất bản (CMS Publishing Lifecycle - Golang)

## 1. Kiến trúc Thông tin Phía Quản trị (Admin CMS IA)
- **Bảng điều khiển (Dashboard):** Tổng quan số lượng leads mới, trạng thái chi nhánh, hoạt động gần đây.
- **Quản lý Giao diện & Thương hiệu:**
  - Cấu hình Site-Shell (Utility bar, Hotline toàn hệ thống, Chi nhánh mặc định).
  - Cấu hình Theme Tokens (Mã màu thương hiệu `primary`, `navy`, `accent`, kiểu bo góc `radius`, font chữ).
  - Menu điều hướng đa cấp (Header Menu, Footer Columns, Mobile Action Bar 5 nút).
- **Trình dựng Trang CMS (Page Builder):**
  - Quản lý trang (`home`, `about`, `solutions`, `contact`).
  - Danh sách Content Blocks dạng kéo thả, sắp xếp `sort_order` và bật/tắt `enabled`.
- **Thư viện Quản lý Media (Media Library):**
  - Quản lý hình ảnh và video với biến thể responsive (Desktop, Tablet, Mobile).
  - Presigned upload lên S3/MinIO, kiểm tra MIME type signature và loại bỏ mã độc.
- **Danh mục Sản phẩm & Dự án:** Quản lý danh mục thiết bị, thương hiệu ủy quyền, thông số kỹ thuật, dự án thi công.
- **Khách hàng Tiềm năng (Leads CRM):** Quản lý trạng thái phễu tư vấn, điều phối chi nhánh và timeline ghi chú.
- **Tự động hóa SEO & Phân quyền:** Quản lý thẻ meta, chuyển hướng 301, công cụ tạo SEO draft từ thông số kỹ thuật.

---

## 2. Vòng đời Nội dung (Content Lifecycle) & Xuất bản Nguyên tử

```text
[Bản nháp (Draft)] ──► [Gửi duyệt (In Review)] ──► [Đã duyệt (Approved)] ──► [Xuất bản (Published)]
        │                                                                             │
        │◄────────────────── Tạo bản sửa đổi mới (New Revision) ──────────────────────┤
        │                                                                             │
        ▼                                                                             ▼
[Lưu phiên bản cũ]                                                          [Lưu trữ (Archived)]
```

### Nguyên tắc Xuất bản Nguyên tử (Atomic Publish Transaction trong Go):
1. **Lưu phiên bản sửa đổi (Revision):** Mỗi khi biên tập viên nhấn lưu, hệ thống tạo một bản ghi mới trong `page_revisions` chứa snapshot toàn bộ mảng `blocks_json` và `seo_json`. Bản ghi này mang tính **bất biến (Immutable)**, không bao giờ bị ghi đè.
2. **Kích hoạt Xuất bản:** Khi người có quyền hạn thực hiện hành động Publish, một DB Transaction của GORM được mở ra:
   - Cập nhật trường `published_revision_id` trong bảng `pages` trỏ tới ID của Revision vừa chọn.
   - Cập nhật trạng thái `publication_state = 'published'` và gán thời gian `published_at = NOW()`.
   - Cập nhật thông tin SEO đã duyệt vào bảng `seo_metadata`.
   - Thêm bản ghi vào bảng `audit_logs` ghi nhận `actor_id`, `action: "PAGE_PUBLISHED"`.
   - Transaction commit thành công.
3. **Quay lui phiên bản (Revert / Rollback):** Nếu muốn quay lại bản trước, hệ thống không sửa đổi lịch sử cũ mà tạo một Revision mới với nội dung sao chép từ Revision mong muốn, sau đó thực hiện xuất bản Revision mới này.
4. **Xem trước An toàn (Secure Preview):** Hệ thống cấp một Preview Token bảo mật dùng một lần hoặc có thời hạn 15 phút (`HMAC-SHA256`). Khách vãng lai và các công cụ bot của Google không thể truy cập nội dung nháp này (`X-Robots-Tag: noindex, nofollow`).

---

## 3. Cơ chế Kiểm tra Tính Hợp lệ của Content Blocks trong Go

Tại tầng Service của CMS, trước khi lưu `blocks_json`, dữ liệu được giải mã và kiểm tra thông qua `validator/v10`:
```go
func ValidateContentBlock(block ContentBlock) error {
    switch block.Type {
    case BlockHeroCarousel:
        var data HeroCarouselData
        if err := json.Unmarshal(block.Data, &data); err != nil {
            return errors.New("dữ liệu heroCarousel không đúng định dạng JSON")
        }
        return commonValidator.Struct(data)
    case BlockFeatureHighlights:
        var data FeatureHighlightsData
        if err := json.Unmarshal(block.Data, &data); err != nil {
            return errors.New("dữ liệu featureHighlights không đúng định dạng")
        }
        return commonValidator.Struct(data)
    case BlockCategoryShowcase:
        var data CategoryShowcaseData
        if err := json.Unmarshal(block.Data, &data); err != nil {
            return errors.New("dữ liệu categoryShowcase không đúng định dạng")
        }
        return commonValidator.Struct(data)
    default:
        return fmt.Errorf("loại block '%s' chưa được hệ thống hỗ trợ", block.Type)
    }
}
```
Nhờ cơ chế này, hệ thống ngăn chặn hoàn toàn việc lưu trữ các block dị tật, thiếu trường bắt buộc, hoặc chứa payload độc hại.

---

## 4. Quản lý Theme & Design Tokens
- Các mã màu (`primaryHex`, `navyHex`, `accentHex`) được kiểm tra bằng regex hex màu chuẩn (`^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`).
- Hệ thống cảnh báo tự động nếu độ tương phản giữa màu nền và chữ không đạt tiêu chuẩn WCAG 2.2 AA (tối thiểu 4.5:1 đối với văn bản thông thường).
- Admin chỉ có quyền thay đổi các giá trị cấu hình cho phép, không thể chèn CSS tùy ý có nguy cơ làm vỡ bố cục hoặc tấn công CSS injection.
