package cms

import (
	"regexp"
	"strings"
)

var phoneCleanRegex = regexp.MustCompile(`[^0-9+]`)

// NormalizePhone converts phone numbers to clean E.164-style string
func NormalizePhone(input string) string {
	cleaned := phoneCleanRegex.ReplaceAllString(input, "")
	if strings.HasPrefix(cleaned, "0") {
		// Convert VN 09... to +849...
		return "+84" + cleaned[1:]
	}
	if !strings.HasPrefix(cleaned, "+") && len(cleaned) >= 9 {
		return "+" + cleaned
	}
	return cleaned
}

// ValidateZaloTarget ensures Zalo URL is valid format
func ValidateZaloTarget(target string) string {
	trimmed := strings.TrimSpace(target)
	if strings.HasPrefix(trimmed, "https://zalo.me/") {
		return trimmed
	}
	phone := NormalizePhone(trimmed)
	phoneNum := strings.TrimPrefix(phone, "+84")
	if phoneNum != "" {
		return "https://zalo.me/0" + phoneNum
	}
	return "https://zalo.me/" + trimmed
}

type SiteShellDTO struct {
	Brand         BrandDTO            `json:"brand"`
	UtilityBar    UtilityBarDTO       `json:"utilityBar"`
	Navigation    []NavigationNodeDTO `json:"navigation"`
	Footer        FooterDTO           `json:"footer"`
	MobileActions []MobileActionDTO   `json:"mobileActions"`
	Theme         ThemeDTO            `json:"theme"`
	SocialDock    []ChannelDTO        `json:"socialDock"`
}

type BrandDTO struct {
	Name string   `json:"name"`
	Logo LogoDTO  `json:"logo"`
}

type LogoDTO struct {
	URL string `json:"url"`
	Alt string `json:"alt"`
}

type UtilityBarDTO struct {
	Visible     bool        `json:"visible"`
	Branches    []BranchDTO `json:"branches"`
	ShowHotline bool        `json:"showHotline"`
	ShowEmail   bool        `json:"showEmail"`
	Hotline     string      `json:"hotline,omitempty"`
	Email       string      `json:"email,omitempty"`
}

type BranchDTO struct {
	ID            string     `json:"id"`
	Code          string     `json:"code"`
	Slug          string     `json:"slug"`
	Name          string     `json:"name"`
	StreetAddress string     `json:"streetAddress"`
	Hours         any        `json:"hours,omitempty"`
	GeoLat        *float64   `json:"geoLat,omitempty"`
	GeoLng        *float64   `json:"geoLng,omitempty"`
	IsActive      bool       `json:"isActive"`
	Channels      []ChannelDTO `json:"channels,omitempty"`
}

type ChannelDTO struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	Label     string `json:"label"`
	Target    string `json:"target"`
	Formatted string `json:"formatted"`
	SortOrder int    `json:"sortOrder"`
}

type NavigationNodeDTO struct {
	ID          string              `json:"id"`
	Label       string              `json:"label"`
	Description *string             `json:"description,omitempty"`
	TargetKind  string              `json:"targetKind"`
	TargetRef   *string             `json:"targetRef,omitempty"`
	ExternalURL *string             `json:"externalUrl,omitempty"`
	SortOrder   int                 `json:"sortOrder"`
	Visibility  string              `json:"visibility"`
	Children    []NavigationNodeDTO `json:"children,omitempty"`
}

type FooterDTO struct {
	Groups       any      `json:"groups"`
	Branches     []BranchDTO `json:"branches"`
	LegalText    string   `json:"legalText"`
	SocialLinks  []ChannelDTO `json:"socialLinks"`
}

type MobileActionDTO struct {
	Key    string    `json:"key"`
	Label  string    `json:"label"`
	Icon   string    `json:"icon,omitempty"`
	Target CtaTarget `json:"target"`
}

type ThemeDTO struct {
	Primary string `json:"primary"`
	Navy    string `json:"navy"`
	Accent  string `json:"accent"`
	Fonts   string `json:"fonts"`
	Radius  string `json:"radius"`
}
