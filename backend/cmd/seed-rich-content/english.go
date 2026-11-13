package main

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"
	"gorm.io/gorm"
)

//go:embed english.json
var englishFixture []byte

type englishPage struct {
	Title  string            `json:"title"`
	Hero   string            `json:"hero"`
	Accent string            `json:"accent"`
	Copy   map[string]string `json:"copy"`
	Long   []section         `json:"long"`
}
type translations struct {
	Solutions map[string]models.EnglishContent `json:"solutions"`
	Common    map[string]string                `json:"common"`
	Pages     map[string]englishPage           `json:"pages"`
	Entities  map[string]map[string][3]string  `json:"entities"`
}

var sharedLabels = map[string]string{
	"Tiết kiệm\nchi phí điện": "Lower\nelectricity costs", "Bền vững\n& an toàn": "Sustainable\nand safe", "Thân thiện\nmôi trường": "Environmentally\nfriendly",
	"Nhận tư vấn miễn phí": "Request a free consultation", "Sản phẩm chính hãng": "Genuine products", "Tư vấn lựa chọn thiết bị": "Equipment selection advice",
	"Đội ngũ chuyên gia": "Experienced specialists", "Tư vấn – Thiết kế – Thi công": "Consultation, design and installation",
	"Chất lượng & an toàn": "Quality and safety", "Theo yêu cầu công trình": "Tailored to your project",
	"Hỗ trợ lâu dài": "Long-term support", "Đồng hành khi vận hành": "Help operating your system", "Thương hiệu thiết bị": "Equipment brands",
	"Đăng Ký Tư Vấn Khảo Sát Mái Miễn Phí": "Request a free roof survey", "Đội ngũ kỹ sư BM SOLAR tại TP.HCM và Quy Nhơn sẵn sàng tư vấn giải pháp tối ưu cho công trình của bạn.": "Our engineers in Ho Chi Minh City and Quy Nhon can advise you on a system for your site.",
	"Tôi đồng ý cho BM SOLAR liên hệ tư vấn theo Chính sách bảo mật thông tin.":                   "I agree to be contacted under the privacy policy.",
	"Trải nghiệm, tư vấn và phát triển giải pháp năng lượng xanh phù hợp cho công trình của bạn.": "Explore clean energy options and get advice on a system for your site.",
}

func translateValues(value any) any {
	switch entry := value.(type) {
	case string:
		if label := sharedLabels[entry]; label != "" {
			return label
		}
	case []any:
		for i, child := range entry {
			entry[i] = translateValues(child)
		}
	case map[string]any:
		for key, child := range entry {
			entry[key] = translateValues(child)
		}
	}
	return value
}

func localizeBlocks(blocks []cms.Block, definition englishPage, common map[string]string) ([]cms.Block, error) {
	var localized []cms.Block
	for _, block := range blocks {
		var data map[string]any
		if err := json.Unmarshal(block.Data, &data); err != nil {
			return nil, err
		}
		if block.ID == "editor_long_content" {
			if len(definition.Long) == 0 {
				continue
			}
			doc, _, err := document(definition.Long, "")
			if err != nil {
				return nil, err
			}
			data = map[string]any{"document": json.RawMessage(doc)}
		} else {
			translateValues(data)
		}
		if block.Type == "heroCarousel" {
			if slides, ok := data["slides"].([]any); ok && len(slides) > 0 {
				if slide, ok := slides[0].(map[string]any); ok {
					slide["title"], slide["accentPhrase"] = definition.Hero, definition.Accent
					slide["eyebrow"] = "BM SOLAR"
					slide["subtitle"] = "Explore clean energy options and get advice on a system for your site."
				}
			}
		}
		if block.ID == "seed_visual_v3_copy" {
			if copy, ok := data["copy"].(map[string]any); ok {
				for key := range copy {
					if text := definition.Copy[key]; text != "" {
						copy[key] = text
					} else if text := common[key]; text != "" {
						copy[key] = text
					}
				}
			}
		}
		raw, err := json.Marshal(data)
		if err != nil {
			return nil, err
		}
		block.Data = raw
		localized = append(localized, block)
	}
	return localized, nil
}

func seedEnglishPage(tx *gorm.DB, key string, definition englishPage, common map[string]string) (bool, error) {
	var existing models.Page
	if err := tx.Where("page_key = ? AND locale = ?", key, "en-US").First(&existing).Error; !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, err
	}
	var source models.Page
	if err := tx.Where("page_key = ? AND locale = ?", key, "vi-VN").First(&source).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	if source.PublishedRevisionID == nil {
		return false, nil
	}
	var original models.PageRevision
	if err := tx.First(&original, "id = ?", *source.PublishedRevisionID).Error; err != nil {
		return false, err
	}
	var blocks []cms.Block
	if err := json.Unmarshal([]byte(original.BlocksJSON), &blocks); err != nil {
		return false, err
	}
	localized, err := localizeBlocks(blocks, definition, common)
	if err != nil {
		return false, err
	}
	raw, err := json.Marshal(localized)
	if err != nil {
		return false, err
	}
	meta, err := json.Marshal(map[string]string{"metaTitle": definition.Title, "metaDescription": "Explore BM SOLAR solar power, storage and installation services in Vietnam."})
	if err != nil {
		return false, err
	}
	seo := string(meta)
	revisionID := id.New()
	page := models.Page{ID: id.New(), PageKey: key, RouteSlug: source.RouteSlug, Title: definition.Title, Locale: "en-US",
		PublicationState: "published", CurrentDraftRevisionID: &revisionID, PublishedRevisionID: &revisionID}
	if err := tx.Create(&page).Error; err != nil {
		return false, err
	}
	if err := tx.Create(&models.PageRevision{ID: revisionID, PageID: page.ID, RevisionNo: 1, BlocksJSON: string(raw), SeoJSON: &seo}).Error; err != nil {
		return false, err
	}
	return true, nil
}

func seedEnglish(tx *gorm.DB) error {
	var fixture translations
	if err := json.Unmarshal(englishFixture, &fixture); err != nil {
		return err
	}
	pages, records := 0, int64(0)
	for key, value := range fixture.Pages {
		added, err := seedEnglishPage(tx, key, value, fixture.Common)
		if err != nil {
			return err
		}
		if added {
			pages++
		}
	}
	for _, table := range []string{"products", "projects", "articles", "solutions"} {
		for slug, value := range fixture.Entities[table] {
			translation := models.EnglishContent{Title: value[0], Summary: value[1], Subtitle: value[1], Body: value[2]}
			raw, err := json.Marshal(translation)
			if err != nil {
				return err
			}
			result := tx.Table(table).Where("slug = ? AND (english IS NULL OR english = '')", slug).Update("english", string(raw))
			if result.Error != nil {
				return result.Error
			}
			records += result.RowsAffected
		}
	}
	for slug, translation := range fixture.Solutions {
		raw, err := json.Marshal(translation)
		if err != nil {
			return err
		}
		result := tx.Table("solutions").Where("slug = ? AND (english IS NULL OR english = '')", slug).Update("english", string(raw))
		if result.Error != nil {
			return result.Error
		}
		records += result.RowsAffected
	}
	fmt.Printf("English pages added: %d; English entity records added: %d\n", pages, records)
	return nil
}
