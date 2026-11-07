# 17 — Implementation plan and gates

## P0 — Audit and contract baseline
- Read docs, inspect all full-page image pairs and loading assets.
- Inspect repo, package versions, backend OpenAPI, asset rights, production domain and branch contacts.
- Outputs: route matrix, component map, section inventory, API gap report, visual precedence/uncertainty log.
- Gate: no coding before core unknowns are documented.

## P1 — Next.js foundation (global)
- Pin Next.js/React/TS; set App Router, lint/typecheck, strict generated API client, design tokens, fonts, CMS fetch layer, global layout, error/not-found/loading.
- Implement header/footer/branch selector, desktop contacts and mobile 5-action bottom nav.
- Gate: shell screenshot QA 1440/390; Call/Zalo behavior validated.

## P2 — Home first
- Implement full-page home from latest references, section by section, all content CMS-driven.
- Verify hero crop, nav, categories, solutions, products, projects, news, partners, consultation, footer.
- Gate: full-page screenshots + diff at 1440, 390, 360; functionality and accessibility pass.

## P3 — Six full-page families
- About → Solutions → Products → Projects → News → Contact. Then detail routes and mobile UI states.
- Each route: page-specific references, typed blocks, metadata, filters, 404/loading/empty, visual QA.
- Gate: no route approved without desktop/mobile full-page comparisons.

## P4 — SEO and hashtag sync
- Dynamic metadata, JSON-LD, canonical, robots/sitemap, slug redirects, query indexing policy.
- Admin suggestion/review flow via `/admin/seo/suggest` and SEO metadata PATCH. Product→article drafts remain un-published until review.
- Gate: crawl rendered HTML, schema validation, tag dedupe tests, publish/unpublish SEO tests.

## P5 — Indexing automation integration
- Signed publish event webhook, Next cache revalidation, published URL feed, sitemap reconciliation, optional Search Console monitoring and IndexNow.
- Gate: idempotency, retry/backoff, credential protection and correct statuses; no generic Google Indexing API calls.

## P6 — Global optimization
- Loading icon/skeletons, image/video optimization, caching, font and JS reduction, Core Web Vitals, mobile safe area, reduced motion.
- Gate: measured metrics and no blocking splash/hydration mismatch.

## P7 — Production QA and handoff
- Typecheck, lint, unit/integration/E2E, axe, screenshot diffs, SEO audit, build, deployment docs.
- Gate: report actual results, URLs, metrics, known issues, assets needing replacement and API dependencies.
