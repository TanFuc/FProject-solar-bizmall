package main

import (
	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"
	"bmsolar-backend/internal/modules/media"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"gorm.io/gorm"
	"log/slog"
	"mime/multipart"
	"net/textproto"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type assetInput struct {
	Key  string `json:"key"`
	File string `json:"file"`
	Alt  string `json:"alt"`
}
type pageInput struct {
	Copy      map[string]string          `json:"copy"`
	Eyebrow   string                     `json:"eyebrow"`
	Benefits  []cms.FeatureHighlightItem `json:"benefits"`
	Key       string                     `json:"key"`
	Route     string                     `json:"route"`
	Title     string                     `json:"title"`
	Accent    string                     `json:"accent"`
	HeroAsset string                     `json:"heroAsset"`
	CTA       string                     `json:"cta"`
	Subtitle  string                     `json:"subtitle"`
}
type binding struct {
	Match string `json:"match"`
	Asset string `json:"asset"`
}
type categoryInput struct {
	Slug  string `json:"slug"`
	Name  string `json:"name"`
	Asset string `json:"asset"`
}
type manifest struct {
	FeatureItems     []cms.FeatureHighlightItem `json:"featureItems"`
	BrandHeadline    string                     `json:"brandHeadline"`
	Categories       []categoryInput            `json:"categories"`
	Version          string                     `json:"version"`
	Assets           []assetInput               `json:"assets"`
	Pages            []pageInput                `json:"pages"`
	CategoryBindings []binding                  `json:"categoryBindings"`
	AudienceBindings []binding                  `json:"audienceBindings"`
}
type galleryItem struct {
	Key      string `json:"key"`
	MediaID  string `json:"mediaId"`
	MediaURL string `json:"mediaUrl"`
	Alt      string `json:"alt"`
}
type galleryData struct {
	Items []galleryItem `json:"items"`
}
type seedHero struct {
	Eyebrow        string                     `json:"eyebrow,omitempty"`
	Benefits       []cms.FeatureHighlightItem `json:"benefits,omitempty"`
	Title          string                     `json:"title"`
	AccentPhrase   string                     `json:"accentPhrase"`
	Subtitle       string                     `json:"subtitle"`
	DesktopMediaID string                     `json:"desktopMediaId"`
	MobileMediaID  string                     `json:"mobileMediaId"`
	CTA            *cms.CtaButton             `json:"cta"`
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
func run() error {
	cfg := config.Load()
	if cfg.DBDriver != "sqlite" || cfg.Env == "production" {
		return errors.New("visual seed is restricted to the local SQLite development database")
	}
	path := "seed-assets/visual-v3/manifest.json"
	if len(os.Args) > 1 {
		path = os.Args[1]
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var m manifest
	if err = json.Unmarshal(raw, &m); err != nil {
		return err
	}
	db, err := database.Connect(cfg, slog.Default())
	if err != nil {
		return err
	}
	backup := filepath.Join(cfg.LocalStoragePath, "before-visual-seed-"+time.Now().Format("20060102-150405")+".db")
	if err = db.Exec("VACUUM INTO ?", backup).Error; err != nil {
		return fmt.Errorf("backup local database: %w", err)
	}
	service := media.NewService(cfg)
	assets := make(map[string]models.MediaAsset)
	for _, input := range m.Assets {
		originalName := "seed-" + m.Version + "-" + input.File
		var existing models.MediaAsset
		err = db.Where("original_name = ? AND status = ?", originalName, "ready").First(&existing).Error
		if err == nil {
			assets[input.Key] = existing
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		data, err := os.ReadFile(filepath.Join(filepath.Dir(path), input.File))
		if err != nil {
			return err
		}
		header := &multipart.FileHeader{Filename: originalName, Size: int64(len(data)), Header: make(textproto.MIMEHeader)}
		result, err := service.SaveUploadedFile(structReader{bytes.NewReader(data)}, header, nil)
		if err != nil {
			return fmt.Errorf("upload seed asset %s: %w", input.Key, err)
		}
		result.Asset.AltText = &input.Alt
		if err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&result.Asset).Error; err != nil {
				return err
			}
			if len(result.Variants) > 0 {
				return tx.Create(&result.Variants).Error
			}
			return nil
		}); err != nil {
			return err
		}
		assets[input.Key] = result.Asset
		fmt.Printf("uploaded %s -> %s\n", input.Key, result.AssetURL)
	}
	logo := assets["logo"]
	var settings models.SiteSetting
	if err := db.First(&settings).Error; err != nil {
		return err
	}
	if err := db.Model(&models.SiteSetting{}).Where("id = ? AND (logo_media_id IS NULL OR logo_media_id = '')", settings.ID).Update("logo_media_id", logo.ID).Error; err != nil {
		return err
	}
	gallery := galleryData{Items: make([]galleryItem, 0, len(m.Assets))}
	for _, input := range m.Assets {
		asset := assets[input.Key]
		gallery.Items = append(gallery.Items, galleryItem{Key: input.Key, MediaID: asset.ID, MediaURL: cfg.ResolveMediaURL(asset.StorageKey), Alt: input.Alt})
	}
	galleryJSON, err := json.Marshal(gallery)
	if err != nil {
		return err
	}

	categoryIDs := make([]string, 0, len(m.Categories))
	for index, input := range m.Categories {
		var row models.ProductCategory
		queryErr := db.Where("slug = ? AND locale = ?", input.Slug, "vi-VN").First(&row).Error
		if errors.Is(queryErr, gorm.ErrRecordNotFound) {
			asset := assets[input.Asset]
			row = models.ProductCategory{ID: id.New(), Slug: input.Slug, Name: input.Name, MediaID: &asset.ID, SortOrder: index, Status: "published", Locale: "vi-VN"}
			if err := db.Create(&row).Error; err != nil {
				return err
			}
		} else if queryErr != nil {
			return queryErr
		}
		categoryIDs = append(categoryIDs, row.ID)
	}
	for _, input := range m.Pages {
		err = db.Transaction(func(tx *gorm.DB) error {
			var page models.Page
			queryErr := tx.Where("page_key = ? AND locale = ?", input.Key, "vi-VN").First(&page).Error
			if errors.Is(queryErr, gorm.ErrRecordNotFound) {
				page = models.Page{ID: id.New(), PageKey: input.Key, RouteSlug: input.Route, Title: input.Title, Locale: "vi-VN", PublicationState: "draft"}
				if err := tx.Create(&page).Error; err != nil {
					return err
				}
			} else if queryErr != nil {
				return queryErr
			}
			blocks := make([]cms.Block, 0)
			var old models.PageRevision
			if page.PublishedRevisionID != nil {
				if err := tx.First(&old, "id = ?", *page.PublishedRevisionID).Error; err != nil {
					return err
				}
				if err := json.Unmarshal([]byte(old.BlocksJSON), &blocks); err != nil {
					return err
				}
			}
			asset := assets[input.HeroAsset]
			hero := seedHero{Eyebrow: input.Eyebrow, Benefits: input.Benefits, Title: input.Title, AccentPhrase: input.Accent, Subtitle: input.Subtitle, DesktopMediaID: asset.ID, MobileMediaID: asset.ID, CTA: &cms.CtaButton{Label: input.CTA, Target: cms.CtaTarget{Kind: "leadForm", FormKey: "consultation"}}}
			heroJSON, err := json.Marshal(struct {
				Slides []seedHero `json:"slides"`
			}{[]seedHero{hero}})
			if err != nil {
				return err
			}
			for index := range blocks {
				if blocks[index].Type == "categoryShowcase" {
					encoded, err := json.Marshal(cms.CategoryShowcaseData{CategoryIDs: categoryIDs, DisplayMode: "grid"})
					if err != nil {
						return err
					}
					blocks[index].Data = encoded
				}
			}
			if input.Key == "home" {
				for index := range blocks {
					if blocks[index].Type == "featureHighlights" {
						encoded, err := json.Marshal(cms.FeatureHighlightsData{Items: m.FeatureItems})
						if err != nil {
							return err
						}
						blocks[index].Data = encoded
					}
				}
			}
			filtered := make([]cms.Block, 0, len(blocks)+2)
			for _, block := range blocks {
				if block.Type != "heroCarousel" && block.ID != "seed_visual_v3_media" && block.ID != "seed_visual_v3_copy" {
					filtered = append(filtered, block)
				}
			}
			filtered = append([]cms.Block{{ID: "seed_visual_v3_hero", Type: "heroCarousel", Version: 1, Enabled: true, SortOrder: 1, Visibility: "all", Data: heroJSON}}, filtered...)
			filtered = append(filtered, cms.Block{ID: "seed_visual_v3_media", Type: "projectGallery", Version: 1, Enabled: true, SortOrder: 999, Visibility: "all", Data: galleryJSON})
			if input.Key == "home" {
				brandJSON, err := json.Marshal(struct {
					Headline string `json:"headline"`
				}{m.BrandHeadline})
				if err != nil {
					return err
				}
				withoutBrand := make([]cms.Block, 0, len(filtered))
				for _, b := range filtered {
					if b.ID != "seed_visual_v3_brands" {
						withoutBrand = append(withoutBrand, b)
					}
				}
				filtered = append(withoutBrand, cms.Block{ID: "seed_visual_v3_brands", Type: "socialGrid", Version: 1, Enabled: true, SortOrder: 900, Visibility: "all", Data: brandJSON})
			}
			if len(input.Copy) > 0 {
				copyJSON, err := json.Marshal(struct {
					Copy map[string]string `json:"copy"`
				}{input.Copy})
				if err != nil {
					return err
				}
				filtered = append(filtered, cms.Block{ID: "seed_visual_v3_copy", Type: "richText", Version: 1, Enabled: true, SortOrder: 998, Visibility: "all", Data: copyJSON})
			}
			encoded, err := json.Marshal(filtered)
			if err != nil {
				return err
			}
			if string(encoded) == old.BlocksJSON {
				return nil
			}
			var maxRev int
			if err := tx.Model(&models.PageRevision{}).Where("page_id = ?", page.ID).Select("COALESCE(MAX(revision_no),0)").Scan(&maxRev).Error; err != nil {
				return err
			}
			revision := models.PageRevision{ID: id.New(), PageID: page.ID, RevisionNo: maxRev + 1, BlocksJSON: string(encoded), SeoJSON: old.SeoJSON}
			if revision.SeoJSON == nil {
				seo := `{}`
				revision.SeoJSON = &seo
			}
			if err := tx.Create(&revision).Error; err != nil {
				return err
			}
			if err := tx.Model(&page).Select("published_revision_id", "current_draft_revision_id", "publication_state").Updates(models.Page{PublishedRevisionID: &revision.ID, CurrentDraftRevisionID: &revision.ID, PublicationState: "published"}).Error; err != nil {
				return err
			}
			return tx.Create(&models.AuditLog{ID: id.New(), Action: "seed.visual_media", EntityType: "page", EntityID: page.ID}).Error
		})
		if err != nil {
			return fmt.Errorf("seed page %s: %w", input.Key, err)
		}
	}
	return db.Transaction(func(tx *gorm.DB) error {
		var categories []models.ProductCategory
		if err := tx.Find(&categories).Error; err != nil {
			return err
		}
		for _, row := range categories {
			for _, b := range m.CategoryBindings {
				if strings.Contains(row.Slug, b.Match) {
					asset := assets[b.Asset]
					replace, err := replaceable(tx, row.MediaID)
					if err != nil {
						return err
					}
					if replace {
						if err := tx.Model(&row).Update("media_id", asset.ID).Error; err != nil {
							return err
						}
					}
				}
			}
		}
		var audiences []models.Audience
		if err := tx.Find(&audiences).Error; err != nil {
			return err
		}
		for _, row := range audiences {
			for _, b := range m.AudienceBindings {
				if row.Code == b.Match {
					asset := assets[b.Asset]
					replace, err := replaceable(tx, row.HeroMediaID)
					if err != nil {
						return err
					}
					if replace {
						if err := tx.Model(&row).Update("hero_media_id", asset.ID).Error; err != nil {
							return err
						}
					}
				}
			}
		}
		var products []models.Product
		if err := tx.Preload("Category").Find(&products).Error; err != nil {
			return err
		}
		for _, row := range products {
			replace, err := replaceable(tx, row.CoverMediaID)
			if err != nil {
				return err
			}
			for _, b := range m.CategoryBindings {
				if row.Category != nil && strings.Contains(row.Category.Slug, b.Match) && replace {
					asset := assets[b.Asset]
					if err := tx.Model(&row).Update("cover_media_id", asset.ID).Error; err != nil {
						return err
					}
				}
			}
		}
		var projects []models.Project
		if err := tx.Find(&projects).Error; err != nil {
			return err
		}
		scenes := []string{"home", "factory", "office", "ev"}
		for index, row := range projects {
			replace, err := replaceable(tx, row.CoverMediaID)
			if err != nil {
				return err
			}
			if replace {
				asset := assets[scenes[index%len(scenes)]]
				if err := tx.Model(&row).Update("cover_media_id", asset.ID).Error; err != nil {
					return err
				}
			}
		}
		var articles []models.Article
		if err := tx.Find(&articles).Error; err != nil {
			return err
		}
		for index, row := range articles {
			replace, err := replaceable(tx, row.CoverMediaID)
			if err != nil {
				return err
			}
			if replace {
				asset := assets[scenes[index%len(scenes)]]
				if err := tx.Model(&row).Update("cover_media_id", asset.ID).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
func (r structReader) Close() error { return nil }

type structReader struct{ *bytes.Reader }

func replaceable(tx *gorm.DB, mediaID *string) (bool, error) {
	if mediaID == nil || *mediaID == "" {
		return true, nil
	}
	var count int64
	if err := tx.Model(&models.MediaAsset{}).Where("id = ? AND status = ?", *mediaID, "ready").Count(&count).Error; err != nil {
		return false, err
	}
	return count == 0, nil
}
