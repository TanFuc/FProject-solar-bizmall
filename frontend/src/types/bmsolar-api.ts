// ==================== COMMON ====================
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T, F = Record<string, unknown>> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters?: F;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
    requestId: string;
  };
}

// ==================== SITE SHELL & CHANNELS ====================
export interface BrandConfig {
  name: string;
  logo: {
    url: string;
    alt: string;
  };
}

export interface ContactChannelItem {
  id: string;
  type: 'phone' | 'zalo' | 'email' | 'facebook' | 'youtube';
  label: string;
  target: string;
  actionUrl?: string; // e.g. "tel:+84932456789" or "https://zalo.me/..."
  formatted?: string;
  sortOrder: number;
}

export interface BranchItem {
  id: string;
  code: string;
  slug: string;
  name: string;
  streetAddress: string;
  hours?: Record<string, string>;
  isActive: boolean;
  channels: ContactChannelItem[];
}

export interface NavigationItemTree {
  id: string;
  label: string;
  targetKind: 'internalRoute' | 'externalUrl' | 'contactChannel' | 'leadForm';
  targetRef?: string;
  externalUrl?: string;
  visibility: 'all' | 'desktopOnly' | 'mobileOnly';
  children?: NavigationItemTree[];
}

export interface MobileActionBarItem {
  key: string;
  label: string;
  icon: string;
  target: {
    kind: 'internalRoute' | 'contactChannel' | 'leadForm' | 'menu';
    routeKey?: string;
    channelType?: 'phone' | 'zalo';
  };
}

export interface ThemeTokens {
  primary: string; // "#0D4EA6"
  navy: string;    // "#0D2E63"
  accent: string;  // "#FF6B19"
  fonts: string;
  radius: string;
}

export interface SiteShellData {
  brand: BrandConfig;
  utilityBar: {
    visible: boolean;
    showHotline: boolean;
    showEmail: boolean;
    announcement?: string;
    branches: BranchItem[];
  };
  navigation: NavigationItemTree[];
  footer: {
    companyName?: string;
    taxCode?: string;
    address?: string;
    hotline?: string;
    email?: string;
    legalText?: string;
  };
  globalChannels: {
    channels: ContactChannelItem[];
  };
  mobileActions: MobileActionBarItem[];
  theme: ThemeTokens;
}

// ==================== CATALOG & PRODUCTS ====================
export interface ProductCategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: string;
  imageUrl?: string;
}

export interface BrandItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface AudienceItem {
  id: string;
  code: 'household' | 'business' | 'industrial';
  label: string;
  description?: string;
  enabled: boolean;
  capacityRange?: string;
  imageUrl?: string;
}

export interface ProductCard {
  id: string;
  sku: string;
  slug: string;
  name: string;
  summary: string;
  status: string;
  coverMediaUrl?: string;
  capacityW?: number;
  warrantyYears?: number;
  tier?: string;
  priceEstimate?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductDetail extends ProductCard {
  description: string;
  specificationJson?: string;
  specsParsed?: Record<string, string>;
  media: Array<{
    id: string;
    mediaUrl: string;
    altText?: string;
    sortOrder: number;
  }>;
  audiences: Array<{
    code: string;
    label: string;
  }>;
}

// ==================== PROJECTS ====================
export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverMediaUrl?: string;
  completedAt?: string;
  capacityKwp?: number;
  projectType?: {
    id: string;
    name: string;
    slug: string;
  };
  province?: {
    id: string;
    name: string;
    code: string;
  };
}

// ==================== EDITORIAL ====================
export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverMediaUrl?: string;
  publishedAt?: string;
  bodyJson?: string;
  category?: string;
  readTimeMinutes?: number;
}

// ==================== LEADS ====================
export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  branchId?: string;
  audienceId?: string;
  productId?: string;
  projectId?: string;
  message: string;
  sourcePage: string;
  privacyConsent: boolean;
  privacyPolicyVersion: string;
  honeypot?: string;
}

// ==================== CMS PAGE & BLOCKS ====================
export type CMSBlockType =
  | 'heroCarousel'
  | 'categoryShowcase'
  | 'audienceShowcase'
  | 'featureHighlights'
  | 'featuredProducts'
  | 'projectShowcase'
  | 'newsSection'
  | 'leadForm'
  | 'faq'
  | 'cta';

export interface CMSBlock<T = Record<string, unknown>> {
  id: string;
  type: CMSBlockType;
  version: number;
  enabled: boolean;
  sortOrder: number;
  visibility: 'all' | 'desktopOnly' | 'mobileOnly';
  data: T;
}

export interface CMSPageData {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  revision: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImageUrl?: string;
    keywords?: string[];
  };
  blocks: CMSBlock[];
}

// ==================== SEO & TAXONOMY ====================
export type SeoResourceType = 'product' | 'post' | 'page' | 'project' | 'solution';

export interface SeoSuggestInput {
  resourceType: SeoResourceType;
  resourceId: string;
  locale: 'vi-VN';
}

export interface SeoSuggestion {
  primaryKeyword: string;
  secondaryKeywords: string[];
  tagSuggestions: string[];
  socialHashtags: string[];
  slugSuggestion: string;
  metaTitleSuggestion?: string;
  metaDescriptionSuggestion?: string;
  warnings?: string[];
}

export interface SeoMetadataUpdate {
  socialHashtags?: string[];
  keywords?: string[];
  primaryKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  robots?: string;
}


