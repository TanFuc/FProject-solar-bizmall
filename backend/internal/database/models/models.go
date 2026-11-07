package models

import (
	"time"
)

// SiteSetting singleton configuration
type SiteSetting struct {
	ID                  string    `gorm:"primaryKey;size:26" json:"id"`
	DefaultBranchID     *string   `gorm:"size:26" json:"defaultBranchId"`
	SiteName            string    `gorm:"size:120;not null" json:"siteName"`
	DefaultLocale       string    `gorm:"size:10;not null;default:'vi-VN'" json:"defaultLocale"`
	SettingsRevision    int       `gorm:"not null;default:1" json:"settingsRevision"`
	UtilityBarJSON      string    `gorm:"type:text;not null" json:"utilityBarJson"`
	FooterConfigJSON    string    `gorm:"type:text;not null" json:"footerConfigJson"`
	MobileActionBarJSON string    `gorm:"type:text;not null" json:"mobileActionBarJson"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

func (SiteSetting) TableName() string { return "site_settings" }

// ThemeSetting visual tokens
type ThemeSetting struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	SiteID      string    `gorm:"size:50;not null;default:'default'" json:"siteId"`
	PrimaryHex  string    `gorm:"size:10;not null" json:"primaryHex"`
	NavyHex     string    `gorm:"size:10;not null" json:"navyHex"`
	AccentHex   string    `gorm:"size:10;not null" json:"accentHex"`
	FontsToken  string    `gorm:"size:50;not null;default:'inter'" json:"fontsToken"`
	RadiusToken string    `gorm:"size:20;not null;default:'md'" json:"radiusToken"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (ThemeSetting) TableName() string { return "theme_settings" }

// Branch physical branch locations
type Branch struct {
	ID            string           `gorm:"primaryKey;size:26" json:"id"`
	Code          string           `gorm:"size:50;not null;uniqueIndex" json:"code"`
	Slug          string           `gorm:"size:100;not null;uniqueIndex" json:"slug"`
	Name          string           `gorm:"size:150;not null" json:"name"`
	ProvinceID    *string          `gorm:"size:26" json:"provinceId"`
	StreetAddress string           `gorm:"size:255;not null" json:"streetAddress"`
	HoursJSON     *string          `gorm:"type:text" json:"hoursJson"`
	GeoLat        *float64         `json:"geoLat"`
	GeoLng        *float64         `json:"geoLng"`
	IsActive      bool             `gorm:"not null;default:true" json:"isActive"`
	SortOrder     int              `gorm:"not null;default:0" json:"sortOrder"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
	Channels      []ContactChannel `gorm:"foreignKey:BranchID" json:"channels,omitempty"`
}

func (Branch) TableName() string { return "branches" }

// ContactChannel phones, zalos, emails, socials per branch or global
type ContactChannel struct {
	ID        string    `gorm:"primaryKey;size:26" json:"id"`
	BranchID  *string   `gorm:"size:26;index:idx_channel_branch_type" json:"branchId"`
	Type      string    `gorm:"size:30;not null;index:idx_channel_branch_type" json:"type"` // phone, zalo, email, facebook, etc.
	Label     string    `gorm:"size:100;not null" json:"label"`
	Target    string    `gorm:"size:255;not null" json:"target"`
	SortOrder int       `gorm:"not null;default:0" json:"sortOrder"`
	Enabled   bool      `gorm:"not null;default:true" json:"enabled"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (ContactChannel) TableName() string { return "contact_channels" }

// NavigationMenu header or footer menu
type NavigationMenu struct {
	ID        string           `gorm:"primaryKey;size:26" json:"id"`
	MenuKey   string           `gorm:"size:50;not null;uniqueIndex:idx_menu_key_locale" json:"menuKey"`
	Locale    string           `gorm:"size:10;not null;default:'vi-VN';uniqueIndex:idx_menu_key_locale" json:"locale"`
	Status    string           `gorm:"size:20;not null;default:'published'" json:"status"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
	Items     []NavigationItem `gorm:"foreignKey:MenuID" json:"items,omitempty"`
}

func (NavigationMenu) TableName() string { return "navigation_menus" }

// NavigationItem recursive menu tree up to depth 3
type NavigationItem struct {
	ID          string           `gorm:"primaryKey;size:26" json:"id"`
	MenuID      string           `gorm:"size:26;not null;index" json:"menuId"`
	ParentID    *string          `gorm:"size:26" json:"parentId"`
	Label       string           `gorm:"size:100;not null" json:"label"`
	TargetKind  string           `gorm:"size:30;not null" json:"targetKind"` // internalRoute, externalUrl, contactChannel, leadForm
	TargetRef   *string          `gorm:"size:100" json:"targetRef"`
	ExternalURL *string          `gorm:"size:500" json:"externalUrl"`
	SortOrder   int              `gorm:"not null;default:0" json:"sortOrder"`
	Visibility  string           `gorm:"size:20;not null;default:'all'" json:"visibility"`
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
	Children    []NavigationItem `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (NavigationItem) TableName() string { return "navigation_items" }

// Page dynamic CMS page
type Page struct {
	ID                     string         `gorm:"primaryKey;size:26" json:"id"`
	PageKey                string         `gorm:"size:50;not null;uniqueIndex:idx_page_key_locale" json:"pageKey"`
	RouteSlug              string         `gorm:"size:150;not null;uniqueIndex:idx_page_route_locale" json:"routeSlug"`
	Title                  string         `gorm:"size:200;not null" json:"title"`
	Locale                 string         `gorm:"size:10;not null;default:'vi-VN';uniqueIndex:idx_page_key_locale;uniqueIndex:idx_page_route_locale" json:"locale"`
	CurrentDraftRevisionID *string        `gorm:"size:26" json:"currentDraftRevisionId"`
	PublishedRevisionID    *string        `gorm:"size:26" json:"publishedRevisionId"`
	PublicationState       string         `gorm:"size:20;not null;default:'draft'" json:"publicationState"` // draft, in_review, approved, published, archived
	CreatedAt              time.Time      `json:"createdAt"`
	UpdatedAt              time.Time      `json:"updatedAt"`
	Revisions              []PageRevision `gorm:"foreignKey:PageID" json:"revisions,omitempty"`
}

func (Page) TableName() string { return "pages" }

// PageRevision immutable snapshot of blocks and seo
type PageRevision struct {
	ID         string    `gorm:"primaryKey;size:26" json:"id"`
	PageID     string    `gorm:"size:26;not null;uniqueIndex:idx_page_rev" json:"pageId"`
	RevisionNo int       `gorm:"not null;uniqueIndex:idx_page_rev" json:"revisionNo"`
	BlocksJSON string    `gorm:"type:text;not null" json:"blocksJson"`
	SeoJSON    *string   `gorm:"type:text" json:"seoJson"`
	CreatedBy  *string   `gorm:"size:26" json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (PageRevision) TableName() string { return "page_revisions" }

// Audience household, business, industrial
type Audience struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	Code        string    `gorm:"size:50;not null;uniqueIndex" json:"code"`
	Label       string    `gorm:"size:100;not null" json:"label"`
	Description *string   `gorm:"size:255" json:"description"`
	HeroMediaID *string   `gorm:"size:26" json:"heroMediaId"`
	Enabled     bool      `gorm:"not null;default:true" json:"enabled"`
	SortOrder   int       `gorm:"not null;default:0" json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Audience) TableName() string { return "audiences" }

// ProductCategory hierarchical categories
type ProductCategory struct {
	ID          string            `gorm:"primaryKey;size:26" json:"id"`
	ParentID    *string           `gorm:"size:26" json:"parentId"`
	Slug        string            `gorm:"size:100;not null;uniqueIndex:idx_category_slug_locale" json:"slug"`
	Name        string            `gorm:"size:150;not null" json:"name"`
	Description *string           `gorm:"type:text" json:"description"`
	MediaID     *string           `gorm:"size:26" json:"mediaId"`
	SortOrder   int               `gorm:"not null;default:0" json:"sortOrder"`
	Status      string            `gorm:"size:20;not null;default:'published'" json:"status"`
	Locale      string            `gorm:"size:10;not null;default:'vi-VN';uniqueIndex:idx_category_slug_locale" json:"locale"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
	Children    []ProductCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (ProductCategory) TableName() string { return "product_categories" }

// Brand manufacturer brand
type Brand struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	Slug        string    `gorm:"size:100;not null;uniqueIndex" json:"slug"`
	Name        string    `gorm:"size:150;not null" json:"name"`
	LogoMediaID *string   `gorm:"size:26" json:"logoMediaId"`
	Description *string   `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Brand) TableName() string { return "brands" }

// Product solar equipment and components
type Product struct {
	ID                string            `gorm:"primaryKey;size:26" json:"id"`
	SKU               string            `gorm:"size:50;not null;uniqueIndex" json:"sku"`
	Slug              string            `gorm:"size:150;not null;uniqueIndex" json:"slug"`
	Name              string            `gorm:"size:200;not null" json:"name"`
	CategoryID        string            `gorm:"size:26;not null;index:idx_product_filter" json:"categoryId"`
	BrandID           *string           `gorm:"size:26;index" json:"brandId"`
	Summary           string            `gorm:"type:text;not null" json:"summary"`
	Description       string            `gorm:"type:text;not null" json:"description"`
	Status            string            `gorm:"size:20;not null;default:'draft';index:idx_product_filter" json:"status"`
	CoverMediaID      *string           `gorm:"size:26" json:"coverMediaId"`
	SpecificationJSON *string           `gorm:"type:text" json:"specificationJson"`
	SeoID             *string           `gorm:"size:26" json:"seoId"`
	PublishedAt       *time.Time        `gorm:"index:idx_product_filter" json:"publishedAt"`
	CreatedAt         time.Time         `json:"createdAt"`
	UpdatedAt         time.Time         `json:"updatedAt"`
	Category          *ProductCategory  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Brand             *Brand            `gorm:"foreignKey:BrandID" json:"brand,omitempty"`
	Media             []ProductMedia    `gorm:"foreignKey:ProductID" json:"media,omitempty"`
	Audiences         []ProductAudience `gorm:"foreignKey:ProductID" json:"audiences,omitempty"`
}

func (Product) TableName() string { return "products" }

// ProductMedia gallery images
type ProductMedia struct {
	ID        string `gorm:"primaryKey;size:26" json:"id"`
	ProductID string `gorm:"size:26;not null;uniqueIndex:idx_prod_media" json:"productId"`
	MediaID   string `gorm:"size:26;not null;uniqueIndex:idx_prod_media" json:"mediaId"`
	SortOrder int    `gorm:"not null;default:0" json:"sortOrder"`
	AltText   string `gorm:"size:255" json:"altText"`
}

func (ProductMedia) TableName() string { return "product_media" }

// ProductAudience junction table
type ProductAudience struct {
	ProductID  string    `gorm:"primaryKey;size:26" json:"productId"`
	AudienceID string    `gorm:"primaryKey;size:26" json:"audienceId"`
	Audience   *Audience `gorm:"foreignKey:AudienceID" json:"audience,omitempty"`
}

func (ProductAudience) TableName() string { return "product_audiences" }

// ProjectType residential, commercial, industrial solar project
type ProjectType struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	Slug        string    `gorm:"size:100;not null;uniqueIndex" json:"slug"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Description *string   `gorm:"size:255" json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (ProjectType) TableName() string { return "project_types" }

// Province Vietnamese provinces and cities
type Province struct {
	ID        string    `gorm:"primaryKey;size:26" json:"id"`
	Code      string    `gorm:"size:30;not null;uniqueIndex" json:"code"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Province) TableName() string { return "provinces" }

// Project completed installations showcase
type Project struct {
	ID            string           `gorm:"primaryKey;size:26" json:"id"`
	Slug          string           `gorm:"size:150;not null;uniqueIndex" json:"slug"`
	Title         string           `gorm:"size:255;not null" json:"title"`
	ProjectTypeID string           `gorm:"size:26;not null;index:idx_project_filter" json:"projectTypeId"`
	ProvinceID    string           `gorm:"size:26;not null;index:idx_project_filter" json:"provinceId"`
	BranchID      *string          `gorm:"size:26" json:"branchId"`
	AudienceID    *string          `gorm:"size:26" json:"audienceId"`
	Summary       string           `gorm:"type:text;not null" json:"summary"`
	BodyJSON      *string          `gorm:"type:text" json:"bodyJson"`
	CompletedAt   *time.Time       `json:"completedAt"`
	Status        string           `gorm:"size:20;not null;default:'draft';index:idx_project_filter" json:"status"`
	CoverMediaID  *string          `gorm:"size:26" json:"coverMediaId"`
	SeoID         *string          `gorm:"size:26" json:"seoId"`
	PublishedAt   *time.Time       `gorm:"index:idx_project_filter" json:"publishedAt"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
	ProjectType   *ProjectType     `gorm:"foreignKey:ProjectTypeID" json:"projectType,omitempty"`
	Province      *Province        `gorm:"foreignKey:ProvinceID" json:"province,omitempty"`
	Products      []ProjectProduct `gorm:"foreignKey:ProjectID" json:"products,omitempty"`
}

func (Project) TableName() string { return "projects" }

// ProjectProduct junction table
type ProjectProduct struct {
	ProjectID string   `gorm:"primaryKey;size:26" json:"projectId"`
	ProductID string   `gorm:"primaryKey;size:26" json:"productId"`
	Product   *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (ProjectProduct) TableName() string { return "project_products" }

// Article news, knowledge base, educational articles
type Article struct {
	ID              string     `gorm:"primaryKey;size:26" json:"id"`
	Slug            string     `gorm:"size:150;not null;uniqueIndex" json:"slug"`
	Title           string     `gorm:"size:255;not null" json:"title"`
	Excerpt         string     `gorm:"type:text;not null" json:"excerpt"`
	BodyJSON        string     `gorm:"type:text;not null" json:"bodyJson"`
	CategoryID      *string    `gorm:"size:26" json:"categoryId"`
	Status          string     `gorm:"size:20;not null;default:'draft';index:idx_article_filter" json:"status"`
	CoverMediaID    *string    `gorm:"size:26" json:"coverMediaId"`
	AuthorID        *string    `gorm:"size:26" json:"authorId"`
	SourceProductID *string    `gorm:"size:26" json:"sourceProductId"`
	SeoID           *string    `gorm:"size:26" json:"seoId"`
	PublishedAt     *time.Time `gorm:"index:idx_article_filter" json:"publishedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

func (Article) TableName() string { return "articles" }

// Tag keywords and labels
type Tag struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	Slug        string    `gorm:"size:100;not null;uniqueIndex:idx_tag_slug_kind" json:"slug"`
	DisplayName string    `gorm:"size:100;not null" json:"displayName"`
	TagKind     string    `gorm:"size:30;not null;default:'general';uniqueIndex:idx_tag_slug_kind" json:"tagKind"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Tag) TableName() string { return "tags" }

// ContentTag entity tagging junction
type ContentTag struct {
	ID         string `gorm:"primaryKey;size:26" json:"id"`
	EntityType string `gorm:"size:30;not null;uniqueIndex:idx_content_tag" json:"entityType"`
	EntityID   string `gorm:"size:26;not null;uniqueIndex:idx_content_tag" json:"entityId"`
	TagID      string `gorm:"size:26;not null;uniqueIndex:idx_content_tag" json:"tagId"`
	Tag        *Tag   `gorm:"foreignKey:TagID" json:"tag,omitempty"`
}

func (ContentTag) TableName() string { return "content_tags" }

// MediaAsset stored media files
type MediaAsset struct {
	ID           string         `gorm:"primaryKey;size:26" json:"id"`
	StorageKey   string         `gorm:"size:255;not null;uniqueIndex" json:"storageKey"`
	OriginalName string         `gorm:"size:255;not null" json:"originalName"`
	MimeType     string         `gorm:"size:100;not null" json:"mimeType"`
	Bytes        int            `gorm:"not null" json:"bytes"`
	Width        *int           `json:"width"`
	Height       *int           `json:"height"`
	Duration     *float64       `json:"duration"`
	AltText      *string        `gorm:"size:255" json:"altText"`
	Status       string         `gorm:"size:20;not null;default:'ready'" json:"status"`
	UploaderID   *string        `gorm:"size:26" json:"uploaderId"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	Variants     []MediaVariant `gorm:"foreignKey:AssetID" json:"variants,omitempty"`
}

func (MediaAsset) TableName() string { return "media_assets" }

// MediaVariant responsive versions of media
type MediaVariant struct {
	ID         string `gorm:"primaryKey;size:26" json:"id"`
	AssetID    string `gorm:"size:26;not null;uniqueIndex:idx_variant_asset_key" json:"assetId"`
	VariantKey string `gorm:"size:30;not null;uniqueIndex:idx_variant_asset_key" json:"variantKey"`
	StorageKey string `gorm:"size:255;not null;uniqueIndex" json:"storageKey"`
	Width      int    `gorm:"not null" json:"width"`
	Height     int    `gorm:"not null" json:"height"`
	SizeBytes  int    `gorm:"not null" json:"sizeBytes"`
}

func (MediaVariant) TableName() string { return "media_variants" }

// SeoMetadata search engine optimization fields
type SeoMetadata struct {
	ID           string    `gorm:"primaryKey;size:26" json:"id"`
	EntityKind   string    `gorm:"size:50;not null;uniqueIndex:idx_seo_entity" json:"entityKind"`
	EntityID     string    `gorm:"size:26;not null;uniqueIndex:idx_seo_entity" json:"entityId"`
	Title        string    `gorm:"size:255;not null" json:"title"`
	Description  string    `gorm:"type:text;not null" json:"description"`
	CanonicalURL *string   `gorm:"size:500" json:"canonicalUrl"`
	Robots       string    `gorm:"size:50;not null;default:'index,follow'" json:"robots"`
	OgMediaID    *string   `gorm:"size:26" json:"ogMediaId"`
	SchemaJSON   *string   `gorm:"type:text" json:"schemaJson"`
	KeywordsJSON *string   `gorm:"type:text" json:"keywordsJson"`
	HashtagsJSON *string   `gorm:"type:text" json:"hashtagsJson"`
	Status       string    `gorm:"size:20;not null;default:'active'" json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (SeoMetadata) TableName() string { return "seo_metadata" }

// SeoRedirect HTTP 301/308 redirect mapping
type SeoRedirect struct {
	ID         string    `gorm:"primaryKey;size:26" json:"id"`
	SourcePath string    `gorm:"size:255;not null;uniqueIndex" json:"sourcePath"`
	TargetPath string    `gorm:"size:255;not null" json:"targetPath"`
	HTTPStatus int       `gorm:"not null;default:301" json:"httpStatus"`
	CreatedBy  *string   `gorm:"size:26" json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (SeoRedirect) TableName() string { return "seo_redirects" }

// SeoJob async SEO processing
type SeoJob struct {
	ID         string     `gorm:"primaryKey;size:26" json:"id"`
	JobKind    string     `gorm:"size:50;not null" json:"jobKind"`
	EntityKind string     `gorm:"size:50;not null" json:"entityKind"`
	EntityID   string     `gorm:"size:26;not null" json:"entityId"`
	Status     string     `gorm:"size:20;not null;default:'pending';index" json:"status"`
	Attempts   int        `gorm:"not null;default:0" json:"attempts"`
	Error      *string    `gorm:"type:text" json:"error"`
	NextRunAt  *time.Time `gorm:"index" json:"nextRunAt"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

func (SeoJob) TableName() string { return "seo_jobs" }

// SeoGenerationDraft AI or deterministic SEO suggestions
type SeoGenerationDraft struct {
	ID            string     `gorm:"primaryKey;size:26" json:"id"`
	SourceKind    string     `gorm:"size:50;not null;index:idx_draft_source" json:"sourceKind"`
	SourceID      string     `gorm:"size:26;not null;index:idx_draft_source" json:"sourceId"`
	PromptVersion string     `gorm:"size:20;not null" json:"promptVersion"`
	ModelName     string     `gorm:"size:50;not null" json:"modelName"`
	ProposedTitle string     `gorm:"size:255;not null" json:"proposedTitle"`
	BodyJSON      string     `gorm:"type:text;not null" json:"bodyJson"`
	MetadataJSON  string     `gorm:"type:text;not null" json:"metadataJson"`
	Status        string     `gorm:"size:20;not null;default:'draft'" json:"status"` // draft, reviewed, converted
	ReviewerID    *string    `gorm:"size:26" json:"reviewerId"`
	ReviewedAt    *time.Time `json:"reviewedAt"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (SeoGenerationDraft) TableName() string { return "seo_generation_drafts" }

// Lead customer consultation inquiry
type Lead struct {
	ID                   string         `gorm:"primaryKey;size:26" json:"id"`
	RefCode              string         `gorm:"size:50;not null;uniqueIndex" json:"refCode"`
	Name                 string         `gorm:"size:120;not null" json:"name"`
	Phone                *string        `gorm:"size:30" json:"phone"`
	Email                *string        `gorm:"size:120" json:"email"`
	BranchID             *string        `gorm:"size:26;index:idx_lead_branch_status" json:"branchId"`
	AudienceID           *string        `gorm:"size:26" json:"audienceId"`
	ProductID            *string        `gorm:"size:26" json:"productId"`
	ProjectID            *string        `gorm:"size:26" json:"projectId"`
	Message              string         `gorm:"type:text;not null" json:"message"`
	SourcePage           string         `gorm:"size:255;not null" json:"sourcePage"`
	UtmJSON              *string        `gorm:"type:text" json:"utmJson"`
	ConsentAt            time.Time      `gorm:"not null" json:"consentAt"`
	PrivacyPolicyVersion string         `gorm:"size:20;not null" json:"privacyPolicyVersion"`
	Status               string         `gorm:"size:20;not null;default:'new';index:idx_lead_branch_status" json:"status"`
	TerminalReason       *string        `gorm:"size:255" json:"terminalReason"`
	AssigneeID           *string        `gorm:"size:26;index" json:"assigneeId"`
	AssignedAt           *time.Time     `json:"assignedAt"`
	IdempotencyKey       *string        `gorm:"size:128;uniqueIndex" json:"idempotencyKey"`
	CreatedAt            time.Time      `json:"createdAt"`
	UpdatedAt            time.Time      `json:"updatedAt"`
	Branch               *Branch        `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	Activities           []LeadActivity `gorm:"foreignKey:LeadID" json:"activities,omitempty"`
}

func (Lead) TableName() string { return "leads" }

// LeadActivity immutable timeline of lead actions
type LeadActivity struct {
	ID         string    `gorm:"primaryKey;size:26" json:"id"`
	LeadID     string    `gorm:"size:26;not null;index" json:"leadId"`
	ActorID    *string   `gorm:"size:26" json:"actorId"`
	Kind       string    `gorm:"size:30;not null" json:"kind"` // created, assigned, status_changed, note_added
	FromStatus *string   `gorm:"size:20" json:"fromStatus"`
	ToStatus   *string   `gorm:"size:20" json:"toStatus"`
	Note       *string   `gorm:"type:text" json:"note"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (LeadActivity) TableName() string { return "lead_activities" }

// User admin / staff account
type User struct {
	ID           string    `gorm:"primaryKey;size:26" json:"id"`
	Email        string    `gorm:"size:120;not null;uniqueIndex" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	DisplayName  string    `gorm:"size:100;not null" json:"displayName"`
	BranchID     *string   `gorm:"size:26" json:"branchId"`
	Status       string    `gorm:"size:20;not null;default:'active'" json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Roles        []Role    `gorm:"many2many:user_roles;" json:"roles,omitempty"`
	Branch       *Branch   `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
}

func (User) TableName() string { return "users" }

// Role authorization role
type Role struct {
	ID          string       `gorm:"primaryKey;size:26" json:"id"`
	Code        string       `gorm:"size:50;not null;uniqueIndex" json:"code"`
	Name        string       `gorm:"size:100;not null" json:"name"`
	Description *string      `gorm:"size:255" json:"description"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

func (Role) TableName() string { return "roles" }

// Permission granular action permission
type Permission struct {
	ID          string    `gorm:"primaryKey;size:26" json:"id"`
	Code        string    `gorm:"size:100;not null;uniqueIndex" json:"code"`
	Description *string   `gorm:"size:255" json:"description"`
	Module      string    `gorm:"size:50;not null" json:"module"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Permission) TableName() string { return "permissions" }

// RolePermission junction
type RolePermission struct {
	RoleID       string `gorm:"primaryKey;size:26" json:"roleId"`
	PermissionID string `gorm:"primaryKey;size:26" json:"permissionId"`
}

func (RolePermission) TableName() string { return "role_permissions" }

// UserRole junction
type UserRole struct {
	UserID string `gorm:"primaryKey;size:26" json:"userId"`
	RoleID string `gorm:"primaryKey;size:26" json:"roleId"`
}

func (UserRole) TableName() string { return "user_roles" }

// AuditLog append-only sensitive mutations
type AuditLog struct {
	ID               string    `gorm:"primaryKey;size:26" json:"id"`
	ActorID          *string   `gorm:"size:26;index" json:"actorId"`
	Action           string    `gorm:"size:100;not null" json:"action"`
	EntityType       string    `gorm:"size:50;not null;index:idx_audit_entity" json:"entityType"`
	EntityID         string    `gorm:"size:26;not null;index:idx_audit_entity" json:"entityId"`
	OldValueRedacted *string   `gorm:"type:text" json:"oldValueRedacted"`
	NewValueRedacted *string   `gorm:"type:text" json:"newValueRedacted"`
	IPHash           *string   `gorm:"size:64" json:"ipHash"`
	CreatedAt        time.Time `json:"createdAt"`
}

func (AuditLog) TableName() string { return "audit_logs" }

// OutboxEvent transactional outbox pattern
type OutboxEvent struct {
	ID            string     `gorm:"primaryKey;size:26" json:"id"`
	EventType     string     `gorm:"size:100;not null" json:"eventType"`
	AggregateType string     `gorm:"size:50;not null" json:"aggregateType"`
	AggregateID   string     `gorm:"size:26;not null" json:"aggregateId"`
	PayloadJSON   string     `gorm:"type:text;not null" json:"payloadJson"`
	Status        string     `gorm:"size:20;not null;default:'pending';index:idx_outbox" json:"status"`
	Attempts      int        `gorm:"not null;default:0" json:"attempts"`
	OccurredAt    time.Time  `gorm:"not null;index:idx_outbox" json:"occurredAt"`
	ProcessedAt   *time.Time `json:"processedAt"`
}

func (OutboxEvent) TableName() string { return "outbox_events" }
