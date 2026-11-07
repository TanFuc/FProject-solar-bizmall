# 12 — Automatic keyword splitting, tags and hashtag generation

## Intent
From approved product, solution, project and article content, automatically **split/normalize Vietnamese terms**, suggest SEO topics, canonical taxonomy tags and a concise **social hashtag string**; send accepted values to NestJS CMS. Hashtags are **NOT** a direct Google indexing/ranking mechanism.

## Source of truth and verified backend contract
The supplied backend OpenAPI defines:
- `POST /admin/seo/suggest` with `{resourceType: 'product'|'post'|'page'|'project'|'solution', resourceId: UUID, locale: 'vi-VN'}`; returns a `SeoSuggestion` with `primaryKeyword`, `secondaryKeywords`, `tagSuggestions`, `socialHashtags`, `slugSuggestion`, metadata suggestions and warnings.
- `PATCH /admin/seo-metadata/{resourceType}/{resourceId}` accepts `SeoMetadataUpdate`, including `keywords: string[]`, `socialHashtags: string[]`, `primaryKeyword`, `metaTitle`, `metaDescription`, `canonicalPath`, `robots`.
- `POST /admin/seo/article-drafts` creates reviewable editorial drafts, not automatic published pages.

These are *contract definitions*; verify the deployed backend. Do not invent a separate hashtags endpoint unless an approved OpenAPI change is made.

## Processing stages
1. On editor action or debounced meaningful content change, request suggestions from backend (do not call on every keystroke; avoid expensive repeated generation).
2. Backend reads approved factual fields: name/title, brand, category, use case, location when verified, specs, article heading/summary/body, existing taxonomy.
3. Unicode normalize, Vietnamese token/phrase extraction (prefer phrase dictionary/segmenter over naïve whitespace split), remove stopwords and unsupported claims, preserve Vietnamese display phrases.
4. Generate candidate `primaryKeyword`, secondary phrases, canonical tag slugs and social hashtags. Normalize hashtags to ASCII PascalCase for compatibility, e.g. `điện mặt trời` → `#DienMatTroi`, `pin lưu trữ` → `#PinLuuTru`; dedupe accent/case-insensitively, filter banned/spam tags.
5. Default 3–7 relevant hashtags (configurable by CMS), maximum length per platform, no repetitive brand stuffing, no numeric spec unless verified. Example string: `#BMSOLAR #DienMatTroi #PinLuuTru #NangLuongXanh` **illustrative only**, not hardcoded in published pages.
6. Show editor a preview with provenance, confidence and warnings. Editor may accept/edit/reject. Persist accepted `socialHashtags` and `keywords` via typed PATCH; show optimistic-concurrency conflict if record version changed.
7. Backend stores canonical tags, suggestion version/source hash, editor decision and audit history. Public frontend displays approved hashtags only when the CMS block requests it; do not append hashtag spam to every article.
8. On product/article update, mark suggestions stale and propose refresh. Never overwrite manually approved metadata silently.

## UI/BE ownership
- **NestJS**: extraction/suggestion algorithm, validation, dedupe, persisted SEO metadata, product→article drafts, publish permissions.
- **Next.js**: typed admin preview and user interaction (if admin UI is in scope), public rendering of approved content; optional local provisional preview cannot replace backend validation.
- No direct Google calls triggered by generating hashtags. Search discovery is handled by the separate publication/indexing pipeline.

## Example types (no `any`)
```ts
type SeoResourceType = 'product' | 'post' | 'page' | 'project' | 'solution';
interface SeoSuggestRequest { resourceType: SeoResourceType; resourceId: string; locale: 'vi-VN'; }
interface SeoHashtagReview { resourceId: string; resourceType: SeoResourceType; acceptedHashtags: readonly string[]; acceptedKeywords: readonly string[]; approvedBy: string; }
interface SeoMetadataPatch { socialHashtags?: string[]; keywords?: string[]; primaryKeyword?: string; }
```

## Acceptance tests
- `Điện mặt trời` and `dien mat troi` deduplicate; `đ`→`d`; Unicode NFC normalization.
- Missing wattage/price/warranty never generates such claims.
- Re-running unchanged input yields stable output; no duplicate hashtags; max count enforced.
- Unauthorized editor cannot PATCH; concurrent updates return conflict; changes are auditable.
- No generic content generated solely to fill keyword targets; editorial review is mandatory before publish.
