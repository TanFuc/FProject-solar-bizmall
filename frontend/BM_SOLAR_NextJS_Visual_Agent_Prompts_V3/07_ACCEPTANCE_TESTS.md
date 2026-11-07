# Definition of Done / Acceptance Criteria

- All 10 URL page families + 2 mobile UI states are implemented, route correctly and follow shared visual language.
- No business content is hardcoded into page components; content and navigation are editable through CMS; local fixtures only for development.
- Responsive at 320, 360, 390, 768, 1024, 1440, 1920 widths; no horizontal overflow; fixed mobile nav never hides important CTA or form controls.
- Branch switch updates Call/Zalo/email across desktop/mobile. Valid `tel:` and verified Zalo links; missing numbers handled safely.
- Filters update query strings and browser history; product/project detail URLs are shareable and crawlable.
- Lead form validates, submits, handles errors, prevents accidental duplicate submissions, and exposes consent language from CMS.
- Strict TypeScript checks, ESLint rules against explicit `any`, schema validation, unit/integration/E2E tests pass.
- Keyboard accessible nav, focus states, contrast, reduced motion, semantic headings and meaningful alt text.
- LCP image prioritized; images responsive and lazy-loaded appropriately; video does not block main content. Performance targets are measured, not claimed.
- Metadata, canonical, Open Graph, sitemap and robots rules are correct for published pages; unpublished content is not indexed.
- Screenshots and visual QA report attached for key pages at desktop and mobile.


## V3 hard acceptance gates
- App Router and Next.js version pinned; Server Components render primary content, no hydration errors, no `any`/unsafe casts.
- Seven top-level pages (home + six full-page pairs) visually compared at desktop/mobile; all detail routes function and use the same design language.
- SEO route HTML is indexable for published pages; valid canonical, metadata, sitemap/robots, structured data only for verified facts; preview/unpublished are excluded.
- Hashtag pipeline uses backend `/admin/seo/suggest`, editor approval and PATCH to `/admin/seo-metadata/...`, with dedupe and deterministic tests.
- Indexing is event-driven, deduped and observable; no unauthorized Google Indexing API use and no false indexed status.
- Branded loading uses skeleton/streaming without artificial waits; no repeated blocking overlay; reduced motion supported.
- Core Web Vitals **targets at p75 field data**: LCP <=2.5s, INP <=200ms, CLS <=0.1. Lighthouse mobile SEO target >=95 and accessibility >=95 in a controlled environment; record actual results, not promises.
- Sitemap, canonical and route cache reflect publish/update/unpublish/slug changes in an end-to-end test.
- Contact Call/Zalo links match the active branch and fail safely if not configured; lead submit works with consent and typed errors.
