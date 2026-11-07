# 07 — Tự động hóa SEO, Chuẩn hóa Tiếng Việt & Schema.org (Golang)

## 1. Quy trình Tự động hóa SEO Đúng Chuẩn (Correct-by-Design SEO Pipeline)

```text
Thông số Kỹ thuật Thực tế
(Công suất, Hãng, Bảo hành, Ứng dụng)
              │
              ▼
Bộ Sinh Gợi ý SEO Nội bộ (Golang Engine)
(Chuẩn hóa Slug Tiếng Việt, Meta Title/Desc, Hashtags, Schema JSON-LD)
              │
              ▼
Bản nháp Gợi ý (SEO Draft) ──► Biên tập viên xem xét & Phê duyệt (Approval Gate)
                                              │
                                              ▼
                                   Kích hoạt Xuất bản (Publish)
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
      Dynamic XML Sitemap Cập nhật                      Render Thẻ Meta & JSON-LD
       (Không chứa trang nháp/404)                        (Cung cấp đầy đủ cho FE)
```

---

## 2. Chuẩn hóa Slug Tiếng Việt trong Golang (Vietnamese Slug Normalizer)

Module SEO cài đặt hàm chuyển đổi chuỗi tiếng Việt có dấu thành URL slug thân thiện, loại bỏ hoàn toàn dấu thanh, dấu mũ, thay thế ký tự đặc biệt bằng dấu gạch ngang (`-`), và tự động xử lý xung đột:

```go
func GenerateSlug(title string) string {
    // 1. Chuyển chữ hoa thành chữ thường
    // 2. Chuyển đổi các ký tự tiếng Việt: à, á, ả, ã, ạ, â, ầ, ấ, ẩ, ẫ, ậ, ă, ằ, ắ... -> a
    //    đ -> d, é, è, ẻ, ẽ, ẹ, ê, ế, ề... -> e, v.v.
    // 3. Thay thế khoảng trắng và ký tự phi chữ số bằng '-'
    // 4. Rút gọn nhiều dấu '-' liên tiếp thành một dấu '-' duy nhất
    // 5. Cắt ngắn tối đa 100 ký tự và loại bỏ '-' ở đầu/cuối chuỗi
}
```

### Xử lý Xung đột Slug & Chuyển hướng 301 (Redirects):
- Nếu slug mới tạo bị trùng trong DB, hệ thống tự động thêm hậu tố số tăng dần (ví dụ: `inverter-deye-5kw-1`, `inverter-deye-5kw-2`).
- Khi người quản trị đổi slug của một sản phẩm/bài viết đã từng xuất bản trước đó, hệ thống tự động ghi một bản ghi vào bảng `seo_redirects` (`source_path` cũ, `target_path` mới, mã `http_status = 301`). Public API kiểm tra bảng này để Frontend thực hiện redirect vĩnh viễn, tránh rớt thứ hạng SEO.

---

## 3. Bộ Sinh Nội dung & Hashtag Tự động (Deterministic & AI Generator)

### Thiết kế Interface Độc lập:
```go
type ProductFacts struct {
    Name         string            `json:"name"`
    CategoryName string            `json:"categoryName"`
    BrandName    string            `json:"brandName"`
    Summary      string            `json:"summary"`
    Specs        map[string]string `json:"specs"` // e.g. {"Công suất": "5kW", "Hiệu suất": "98%"}
}

type SeoDraft struct {
    SuggestedTitle       string   `json:"suggestedTitle"`
    SuggestedDescription string   `json:"suggestedDescription"`
    SuggestedSlug        string   `json:"suggestedSlug"`
    Hashtags             []string `json:"hashtags"`
    ArticleOutline       string   `json:"articleOutline"`
    SampleArticleBody    string   `json:"sampleArticleBody"`
}

type SeoDraftGenerator interface {
    GenerateDraft(ctx context.Context, facts ProductFacts) (*SeoDraft, error)
}
```

- **Mặc định (Deterministic Engine):** Hoạt động hoàn toàn bằng thuật toán nội bộ viết bằng Go, trích xuất từ khóa từ thông số kỹ thuật, sinh tiêu đề chuẩn SEO (45–60 ký tự), mô tả (140–160 ký tự), các hashtag chuyên ngành (`#BMSOLAR`, `#InverterHoaLuoi`, `#DienMatTroi`), và dàn ý bài viết kỹ thuật. **Không tốn chi phí gọi API bên ngoài**.
- **Mở rộng (AI Provider):** Khi người dùng cấu hình `SEO_AI_API_KEY` (Gemini hoặc OpenAI), hệ thống sẽ gọi API để làm phong phú thêm văn phong, nhưng **luôn tuân thủ nguyên tắc: Nội dung AI chỉ là Bản nháp (Draft), bắt buộc biên tập viên duyệt mới được xuất bản**. Không bịa đặt chứng chỉ, giá cả hoặc cam kết hiệu suất sai sự thật.

---

## 4. Hiện thực về Indexing của Công cụ Tìm kiếm (Google Indexing Reality)
- **Cảnh báo nghiêm ngặt:** Google Indexing API **chỉ dành riêng** cho dữ liệu tuyển dụng (`JobPosting`) và sự kiện trực tiếp (`BroadcastEvent`). Tuyệt đối không gọi Google Indexing API cho sản phẩm điện mặt trời hay bài viết tin tức.
- **Giải pháp chính thống:**
  1. Xây dựng endpoint dynamic XML sitemap: `/api/v1/public/sitemap.xml` sinh ra danh sách toàn bộ các URL hợp lệ đã xuất bản (`<loc>`, `<lastmod>`, `<changefreq>`).
  2. Trang chưa xuất bản (Draft) hoặc lỗi 404 tuyệt đối không nằm trong sitemap.
  3. Cung cấp file `robots.txt` cho phép bot thu thập thông tin các trang public và chặn các trang `/admin/*`.
  4. Hỗ trợ cấu hình tích hợp Google Search Console sitemap ping khi quản trị viên chủ động kích hoạt.

---

## 5. Cấu trúc Dữ liệu Có cấu trúc (Schema.org JSON-LD)
API cung cấp sẵn dữ liệu JSON-LD chuẩn xác cho từng loại trang để Frontend chỉ việc nhúng vào thẻ `<script type="application/ld+json">`:
- **Trang chủ / Chi nhánh:** `LocalBusiness` / `Organization` kèm tên công ty, số hotline chi nhánh đã xác thực, tọa độ địa lý, giờ mở cửa.
- **Trang Sản phẩm:** Schema `Product` với thông tin thương hiệu, model, mô tả, và CTA yêu cầu báo giá (`PriceSpecification` hoặc `AggregateOffer` phù hợp với mô hình không có giỏ hàng).
- **Trang Chi tiết:** Schema `BreadcrumbList` định vị cây thư mục từ Trang chủ -> Danh mục -> Chi tiết.
- **Trang Bài viết:** Schema `Article` / `NewsArticle` kèm ngày đăng và tác giả.
