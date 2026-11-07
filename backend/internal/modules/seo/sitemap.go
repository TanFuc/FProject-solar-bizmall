package seo

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"time"

	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"

	"gorm.io/gorm"
)

type URL struct {
	XMLName    xml.Name `xml:"url"`
	Loc        string   `xml:"loc"`
	LastMod    string   `xml:"lastmod,omitempty"`
	ChangeFreq string   `xml:"changefreq,omitempty"`
	Priority   string   `xml:"priority,omitempty"`
}

type URLSet struct {
	XMLName xml.Name `xml:"urlset"`
	XMLNS   string   `xml:"xmlns,attr"`
	URLs    []URL    `xml:"url"`
}

// GenerateSitemap builds dynamic XML sitemap containing only canonical published indexable pages
func GenerateSitemap(db *gorm.DB, cfg *config.Config) ([]byte, error) {
	baseURL := cfg.WebPublicURL
	now := time.Now().UTC().Format("2006-01-02")

	urls := make([]URL, 0)

	// Core pages
	staticRoutes := []struct {
		Path     string
		Priority string
	}{
		{"/", "1.0"},
		{"/gioi-thieu", "0.8"},
		{"/giai-phap", "0.9"},
		{"/san-pham", "0.9"},
		{"/du-an", "0.8"},
		{"/tin-tuc", "0.7"},
		{"/lien-he", "0.8"},
	}

	for _, sr := range staticRoutes {
		urls = append(urls, URL{
			Loc:        baseURL + sr.Path,
			LastMod:    now,
			ChangeFreq: "weekly",
			Priority:   sr.Priority,
		})
	}

	// Published dynamic CMS pages
	var pages []models.Page
	db.Where("publication_state = 'published'").Find(&pages)
	for _, p := range pages {
		if p.RouteSlug != "/" {
			urls = append(urls, URL{
				Loc:        fmt.Sprintf("%s/%s", baseURL, p.RouteSlug),
				LastMod:    p.UpdatedAt.Format("2006-01-02"),
				ChangeFreq: "weekly",
				Priority:   "0.8",
			})
		}
	}

	// Published products
	var products []models.Product
	db.Where("status = 'published'").Find(&products)
	for _, prod := range products {
		lastmod := prod.UpdatedAt.Format("2006-01-02")
		if prod.PublishedAt != nil {
			lastmod = prod.PublishedAt.Format("2006-01-02")
		}
		urls = append(urls, URL{
			Loc:        fmt.Sprintf("%s/san-pham/%s", baseURL, prod.Slug),
			LastMod:    lastmod,
			ChangeFreq: "weekly",
			Priority:   "0.8",
		})
	}

	// Published projects
	var projects []models.Project
	db.Where("status = 'published'").Find(&projects)
	for _, proj := range projects {
		lastmod := proj.UpdatedAt.Format("2006-01-02")
		if proj.PublishedAt != nil {
			lastmod = proj.PublishedAt.Format("2006-01-02")
		}
		urls = append(urls, URL{
			Loc:        fmt.Sprintf("%s/du-an/%s", baseURL, proj.Slug),
			LastMod:    lastmod,
			ChangeFreq: "monthly",
			Priority:   "0.7",
		})
	}

	// Published articles
	var articles []models.Article
	db.Where("status = 'published'").Find(&articles)
	for _, art := range articles {
		lastmod := art.UpdatedAt.Format("2006-01-02")
		if art.PublishedAt != nil {
			lastmod = art.PublishedAt.Format("2006-01-02")
		}
		urls = append(urls, URL{
			Loc:        fmt.Sprintf("%s/tin-tuc/%s", baseURL, art.Slug),
			LastMod:    lastmod,
			ChangeFreq: "weekly",
			Priority:   "0.6",
		})
	}

	urlSet := URLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  urls,
	}

	data, err := xml.MarshalIndent(urlSet, "", "  ")
	if err != nil {
		return nil, err
	}

	output := []byte(xml.Header + string(data))
	return output, nil
}

// ServeSitemap returns XML sitemap with caching headers
func ServeSitemap(db *gorm.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sitemapBytes, err := GenerateSitemap(db, cfg)
		if err != nil {
			http.Error(w, "Failed to build sitemap", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/xml; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=3600")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(sitemapBytes)
	}
}
