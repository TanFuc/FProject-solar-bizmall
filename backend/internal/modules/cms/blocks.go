package cms

import (
	"bmsolar-backend/internal/common/richcontent"
	"encoding/json"
	"fmt"
)

// CtaTarget represents a strongly-typed destination
type CtaTarget struct {
	Kind        string `json:"kind"` // internalRoute, contactChannel, leadForm, externalUrl
	RouteKey    string `json:"routeKey,omitempty"`
	ChannelType string `json:"channelType,omitempty"`
	FormKey     string `json:"formKey,omitempty"`
	URL         string `json:"url,omitempty"`
	Params      any    `json:"params,omitempty"`
}

// Block represents any typed CMS content block
type Block struct {
	ID         string          `json:"id"`
	Type       string          `json:"type"`
	Version    int             `json:"version"`
	Enabled    bool            `json:"enabled"`
	SortOrder  int             `json:"sortOrder"`
	Visibility string          `json:"visibility"` // all, desktopOnly, mobileOnly
	Data       json.RawMessage `json:"data"`
}

// HeroSlide for heroCarousel block
type HeroSlide struct {
	Eyebrow          string                 `json:"eyebrow,omitempty"`
	Benefits         []FeatureHighlightItem `json:"benefits,omitempty"`
	SecondaryCtaText string                 `json:"secondaryCtaText,omitempty"`
	AccentPhrase     string                 `json:"accentPhrase,omitempty"`
	Title            string                 `json:"title"`
	Subtitle         string                 `json:"subtitle,omitempty"`
	DesktopMediaID   string                 `json:"desktopMediaId"`
	MobileMediaID    string                 `json:"mobileMediaId,omitempty"`
	DesktopMediaURL  string                 `json:"desktopMediaUrl,omitempty"`
	MobileMediaURL   string                 `json:"mobileMediaUrl,omitempty"`
	OverlayOpacity   float64                `json:"overlayOpacity,omitempty"`
	CTA              *CtaButton             `json:"cta,omitempty"`
}

type CtaButton struct {
	Label  string    `json:"label"`
	Target CtaTarget `json:"target"`
}

// HeroCarouselData
type HeroCarouselData struct {
	Slides []HeroSlide `json:"slides"`
}

// FeatureHighlightItem
type FeatureHighlightItem struct {
	IconToken   string `json:"iconToken"`
	Label       string `json:"label"`
	Description string `json:"description,omitempty"`
}

type FeatureHighlightsData struct {
	Items []FeatureHighlightItem `json:"items"`
}

// CategoryShowcaseData
type CategoryShowcaseData struct {
	CategoryIDs []string `json:"categoryIds"`
	DisplayMode string   `json:"displayMode,omitempty"` // grid, carousel
}

// AudienceShowcaseData
type AudienceShowcaseData struct {
	AudienceCodes []string `json:"audienceCodes"`
}

// RichTextData
type RichTextData struct {
	HTMLSanitized string `json:"htmlSanitized"`
}

// FaqItem
type FaqItem struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type FaqData struct {
	Items []FaqItem `json:"items"`
}

// ValidateBlock ensures the block has known type and valid payload
func ValidateBlock(b *Block) error {
	if b.ID == "" {
		return fmt.Errorf("block id is required")
	}
	if b.Type == "" {
		return fmt.Errorf("block type is required")
	}

	knownTypes := map[string]bool{
		"heroCarousel":      true,
		"featureHighlights": true,
		"categoryShowcase":  true,
		"audienceShowcase":  true,
		"solutionGrid":      true,
		"projectGallery":    true,
		"productGrid":       true,
		"articleFeed":       true,
		"videoFeature":      true,
		"richText":          true,
		"stats":             true,
		"faq":               true,
		"testimonials":      true,
		"contactPanel":      true,
		"branchLocations":   true,
		"leadForm":          true,
		"socialGrid":        true,
		"ctaBanner":         true,
	}

	if !knownTypes[b.Type] {
		return fmt.Errorf("unsupported block type: %s", b.Type)
	}

	if b.Type == "richText" {
		var copyBlock struct {
			Copy struct {
				BrandStoryDocument string `json:"brandStoryDocument"`
			} `json:"copy"`
		}
		if err := json.Unmarshal(b.Data, &copyBlock); err != nil {
			return err
		}
		return richcontent.Validate(string(b.Data), copyBlock.Copy.BrandStoryDocument)
	}
	return nil
}
