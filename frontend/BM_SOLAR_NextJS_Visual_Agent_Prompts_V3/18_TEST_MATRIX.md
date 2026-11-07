# 18 — Test matrix for Next.js, SEO, indexing and visuals

| Area | Scenario | Expected |
|---|---|---|
| Rendering | JS disabled on product/article | Useful server-rendered content and links visible |
| Metadata | Published product detail | Unique title, description, canonical, correct robots |
| Metadata | Draft/preview | Authenticated, noindex; absent from sitemap |
| Redirect | Product slug changed | Old path 301 to new canonical; no redirect loop |
| Sitemap | Publish/update/unpublish | Correct add/lastmod/remove; no draft URLs |
| Sitemap | 50k+ URLs | Partition within limits; stable index |
| Filters | Project type/region query | Shareable URL, server results, canonical policy |
| Hashtags | Vietnamese accents/case | Deterministic normalization and dedupe |
| Hashtags | Unsupported numeric claim | Rejected; warnings shown |
| Hashtags | Editor rejects suggestion | No published metadata change |
| Hashtags | Editor accepts | Typed PATCH; audit and version conflict handling |
| Indexing | Sitemap submit | State is submitted, NOT indexed |
| Indexing | GSC reports not indexed | Observed status retained with timestamp |
| Indexing | Retry event twice | Idempotent single effective action |
| Indexing | Product publish | NO Google Indexing API URL push |
| Cache | CMS publish | Next page/listing/metadata revalidated |
| Cache | Unpublish | URL no longer exposes published content |
| Loading | Route navigation | Scoped skeleton, no full-screen splash |
| Loading | Slow image | Reserved aspect ratio, no CLS |
| Loading | Reduced motion | No continuous animation |
| Contact | Branch switch | All Call/Zalo/email links update |
| Contact | Missing phone | Action disabled safely, no fake number |
| Lead | Duplicate click | One submission, typed pending/success/error |
| Security | Invalid webhook HMAC | 401/403, no revalidation |
| Security | Replay webhook | Rejected/deduped |
| Visual | Home 1440/390 | Full-page screenshots and diff |
| Visual | Six pages 1440/390 | Each has full-page screenshot and diff |
| Accessibility | Keyboard nav/forms | Focus visible, labels, 44px touch targets |
| Performance | Mobile throttling | LCP/INP/CLS measured; targets reported |

### CI commands (adapt to package scripts)
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build`, `npm run test:visual`, `npm run audit:seo`. Do not claim these scripts exist until added. Archive Playwright screenshots and Lighthouse reports.
