// Adds editable long-form content to the known local demo records.
package main

import (
	_ "embed"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"os"
	"strings"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database"
	"bmsolar-backend/internal/database/models"
	"bmsolar-backend/internal/modules/cms"

	"gorm.io/gorm"
)

//go:embed documents.json
var fixture []byte

type section [2]string

type documents struct {
	About    []section            `json:"about"`
	Projects map[string][]section `json:"projects"`
	Products map[string][]section `json:"products"`
	Articles map[string][]section `json:"articles"`
}

type node struct {
	Type  string `json:"type"`
	Attrs *struct {
		Level int `json:"level"`
	} `json:"attrs,omitempty"`
	Content []node `json:"content,omitempty"`
	Text    string `json:"text,omitempty"`
}

func block(kind, text string, level int) node {
	n := node{Type: kind, Content: []node{{Type: "text", Text: text}}}
	if level > 0 {
		n.Attrs = &struct {
			Level int `json:"level"`
		}{Level: level}
	}
	return n
}

func document(sections []section, legacy string) ([]byte, bool, error) {
	var previous struct {
		Type     string          `json:"type"`
		Document json.RawMessage `json:"document"`
		Content  json.RawMessage `json:"content"`
		Blocks   []struct {
			Type    string `json:"type"`
			Content string `json:"content"`
		} `json:"blocks"`
	}
	parsed := json.Unmarshal([]byte(legacy), &previous) == nil
	if parsed && (previous.Type == "doc" || len(previous.Document) > 0) {
		return nil, false, nil
	}
	var content []node
	if parsed {
		for _, entry := range previous.Blocks {
			if strings.TrimSpace(entry.Content) == "" {
				continue
			}
			if entry.Type == "heading" {
				content = append(content, block("heading", entry.Content, 2))
			} else if entry.Type == "paragraph" {
				content = append(content, block("paragraph", entry.Content, 0))
			}
		}
		var legacyText string
		if json.Unmarshal(previous.Content, &legacyText) == nil && legacyText != "" {
			content = append(content, block("paragraph", legacyText, 0))
		}
	} else if strings.TrimSpace(legacy) != "" {
		content = append(content, block("paragraph", legacy, 0))
	}
	for _, entry := range sections {
		content = append(content, block("heading", entry[0], 2), block("paragraph", entry[1], 0))
	}
	doc, err := json.Marshal(node{Type: "doc", Content: content})
	if err != nil || !parsed {
		return doc, true, err
	}
	var wrapper map[string]json.RawMessage
	if err := json.Unmarshal([]byte(legacy), &wrapper); err != nil {
		return nil, false, err
	}
	if wrapper == nil {
		return doc, true, nil
	}
	wrapper["document"] = doc
	result, err := json.Marshal(wrapper)
	return result, true, err
}

func seedAbout(tx *gorm.DB, entries []section) (bool, error) {
	var page models.Page
	err := tx.Where("page_key = ? AND locale = ? AND publication_state = ?", "about", "vi-VN", "published").First(&page).Error
	if err == gorm.ErrRecordNotFound {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if page.PublishedRevisionID == nil || (page.CurrentDraftRevisionID != nil && *page.CurrentDraftRevisionID != *page.PublishedRevisionID) {
		return false, nil
	}
	var revision models.PageRevision
	if err := tx.Where("id = ?", *page.PublishedRevisionID).First(&revision).Error; err != nil {
		return false, err
	}
	var blocks []cms.Block
	if err := json.Unmarshal([]byte(revision.BlocksJSON), &blocks); err != nil {
		return false, err
	}
	for _, b := range blocks {
		if b.ID == "editor_long_content" {
			return false, nil
		}
	}
	doc, _, err := document(entries, "")
	if err != nil {
		return false, err
	}
	data, err := json.Marshal(struct {
		Document json.RawMessage `json:"document"`
	}{Document: doc})
	if err != nil {
		return false, err
	}
	blocks = append(blocks, cms.Block{ID: "editor_long_content", Type: "richText", Enabled: true, Version: 1, SortOrder: 80, Visibility: "all", Data: data})
	body, err := json.Marshal(blocks)
	if err != nil {
		return false, err
	}
	var latest models.PageRevision
	if err := tx.Where("page_id = ?", page.ID).Order("revision_no desc").First(&latest).Error; err != nil {
		return false, err
	}
	next := models.PageRevision{ID: id.New(), PageID: page.ID, RevisionNo: latest.RevisionNo + 1, BlocksJSON: string(body), SeoJSON: revision.SeoJSON}
	if err := tx.Create(&next).Error; err != nil {
		return false, err
	}
	return true, tx.Model(&page).Updates(models.Page{PublishedRevisionID: &next.ID, CurrentDraftRevisionID: &next.ID}).Error
}

func seedRecords(tx *gorm.DB, table, column string, entries map[string][]section) (int, error) {
	count := 0
	for slug, sections := range entries {
		var row struct {
			ID   string
			Body *string
		}
		err := tx.Table(table).Select("id, "+column+" AS body").Where("slug = ? AND status = ?", slug, "published").First(&row).Error
		if err == gorm.ErrRecordNotFound {
			continue
		}
		if err != nil {
			return count, err
		}
		legacy := ""
		if row.Body != nil {
			legacy = *row.Body
		}
		body, changed, err := document(sections, legacy)
		if err != nil {
			return count, err
		}
		if !changed {
			continue
		}
		if err := tx.Table(table).Where("id = ?", row.ID).Update(column, string(body)).Error; err != nil {
			return count, err
		}
		if err := tx.Create(&models.AuditLog{ID: id.New(), Action: "seed_document", EntityType: table, EntityID: row.ID}).Error; err != nil {
			return count, err
		}
		count++
	}
	return count, nil
}

func main() {
	path := flag.String("db", "", "Path to the existing local SQLite file")
	english := flag.Bool("english", false, "Add English content for known demo records")
	flag.Parse()
	if *path == "" || !strings.HasSuffix(strings.ToLower(*path), ".db") {
		log.Fatal("provide an existing local SQLite database file with -db")
	}
	if info, err := os.Stat(*path); err != nil || !info.Mode().IsRegular() {
		log.Fatal("database must be an existing regular file")
	}
	var content documents
	if err := json.Unmarshal(fixture, &content); err != nil {
		log.Fatal(err)
	}
	db, err := database.Connect(&config.Config{DBDriver: "sqlite", DatabaseURL: *path}, slog.Default())
	if err != nil {
		log.Fatal(err)
	}
	if err := db.Transaction(func(tx *gorm.DB) error {
		about, err := seedAbout(tx, content.About)
		if err != nil {
			return err
		}
		fmt.Printf("About document added: %t\n", about)
		for _, target := range []struct {
			table, column string
			entries       map[string][]section
		}{
			{"projects", "body_json", content.Projects},
			{"products", "description", content.Products},
			{"articles", "body_json", content.Articles},
		} {
			count, err := seedRecords(tx, target.table, target.column, target.entries)
			if err != nil {
				return err
			}
			fmt.Printf("%s documents added: %d\n", target.table, count)
		}
		if *english {
			return seedEnglish(tx)
		}
		return nil
	}); err != nil {
		log.Fatal(err)
	}
}
