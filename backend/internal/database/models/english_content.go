package models

import (
	"encoding/json"
	"strings"
)

// EnglishContent stores an optional English edition of a published record.
// Shared media, identifiers, and technical metadata stay on the source record.
type EnglishContent struct {
	BenefitsText  string `json:"benefitsText,omitempty"`
	EquipmentText string `json:"equipmentText,omitempty"`
	ProcessText   string `json:"processText,omitempty"`
	Title         string `json:"title,omitempty"`
	Summary       string `json:"summary,omitempty"`
	Body          string `json:"body,omitempty"`
	Subtitle      string `json:"subtitle,omitempty"`
	Capacity      string `json:"capacity,omitempty"`
	Savings       string `json:"savings,omitempty"`
	ROI           string `json:"roi,omitempty"`
	Warranty      string `json:"warranty,omitempty"`
}

func (c *EnglishContent) Available() bool {
	return c != nil && strings.TrimSpace(c.Title) != ""
}

func LocalizedText(fallback string, translation string) string {
	if strings.TrimSpace(translation) == "" {
		return fallback
	}
	return translation
}

func (c *EnglishContent) ContentBody() string {
	if c == nil {
		return ""
	}
	return c.Body
}

func (c *EnglishContent) BodyJSON(fallback string) string {
	if strings.TrimSpace(c.Body) == "" {
		return fallback
	}
	var document struct {
		Type string `json:"type"`
	}
	if json.Unmarshal([]byte(c.Body), &document) == nil && document.Type == "doc" {
		return c.Body
	}
	encoded, err := json.Marshal(struct {
		Content string `json:"content"`
	}{Content: c.Body})
	if err != nil {
		return fallback
	}
	return string(encoded)
}
