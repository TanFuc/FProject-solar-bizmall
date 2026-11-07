// Illustrative typed adapter types. Generate final DTO types from the actual backend OpenAPI.
export type SeoResourceType = 'product' | 'post' | 'page' | 'project' | 'solution';
export type Locale = 'vi-VN';

export interface SeoSuggestInput {
  readonly resourceType: SeoResourceType;
  readonly resourceId: string;
  readonly locale: Locale;
}

export interface SeoSuggestion {
  readonly slugSuggestion: string;
  readonly titleSuggestions: readonly string[];
  readonly descriptionSuggestions: readonly string[];
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly tagSuggestions: readonly string[];
  readonly socialHashtags: readonly string[];
  readonly imageAltSuggestions?: readonly string[];
  readonly warnings: readonly string[];
}

export interface SeoMetadataUpdate {
  readonly metaTitle?: string;
  readonly metaDescription?: string;
  readonly canonicalPath?: string;
  readonly robots?: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  readonly primaryKeyword?: string;
  readonly keywords?: readonly string[];
  readonly socialHashtags?: readonly string[];
}

export type SeoJobState =
  | { readonly kind: 'queued'; readonly queuedAt: string }
  | { readonly kind: 'submitted'; readonly provider: 'indexnow' | 'gsc_sitemap'; readonly submittedAt: string }
  | { readonly kind: 'observed'; readonly provider: 'gsc'; readonly indexed: boolean | null; readonly observedAt: string }
  | { readonly kind: 'failed'; readonly code: string; readonly retryable: boolean };
