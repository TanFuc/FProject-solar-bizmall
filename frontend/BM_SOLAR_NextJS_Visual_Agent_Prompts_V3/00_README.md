# BM SOLAR — Next.js Visual-to-Code Agent Pack V3

**Scope:** production-grade Next.js App Router frontend, faithful implementation of the latest BM SOLAR full-page desktop/mobile designs, NestJS CMS integration, measurable technical SEO, approved hashtag automation, safe search-indexing workflow, branded loading and site-wide optimization.

## Read order (mandatory)
`AGENTS.md` → `01_MASTER_AGENT_PROMPT.md` → `15_REFERENCE_MAP_AND_VISUAL_PRECEDENCE.md` → `03_PAGE_BLUEPRINTS.md` → `02_DESIGN_SYSTEM.md` → `10_NEXTJS_ARCHITECTURE.md` → `05_CMS_API_CONTRACT.md` → `11_TECHNICAL_SEO.md` → `12_HASHTAG_PIPELINE.md` → `13_INDEXING_AUTOMATION.md` → `14_GLOBAL_LOADING_PERFORMANCE.md` → `06_VISUAL_QA.md` → `07_ACCEPTANCE_TESTS.md` → `17_IMPLEMENTATION_PLAN.md`.

## Visual source of truth
- `references/home-desktop-full.png` and `references/home-mobile-full.png`: newest full-page **home** designs.
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_{gioi-thieu,giai-phap,san-pham,du-an,tin-tuc,lien-he}_{desktop,mobile}.png`: authoritative six-page desktop/mobile designs, full vertical scroll.
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_loading_*`: loading concept references; implement an accessible, fast loading system, not an animated screenshot.
- `references/contact-*-supplement.jpg`: supplementary contact references; if conflicts, document and defer to full-page source unless user explicitly approves a newer replacement.
- `references/hero-desktop-mobile.png` and `references/all-pages-storyboard.png`: legacy reference only; NEVER override the new full-page assets.
- For routes/states without direct image, extend the shared design system conservatively and log assumptions.

**Technical source of truth:** actual backend OpenAPI, not invented endpoints. A **design-time snapshot** is bundled in `contracts/backend-openapi-reference.yaml` and `contracts/page-blocks.schema.json`; compare with the actual latest backend repository before implementation. If no live backend exists, use a typed mock adapter and mark contract unverified. Never claim an API is deployed without checking.

## Absolute requirements
1. Next.js App Router + React + TypeScript strict, no `any`, no unvalidated external JSON, no business-content hardcoding.
2. No redesign, no screenshot-as-page, no generic SaaS template. Implement real semantic components with genuine media assets.
3. Every page must be CMS-driven; real products/projects/articles/branches come from NestJS Public API.
4. Desktop and mobile visual QA for each page, including full-page screenshots, diff report and functional interactions.
5. Global Call/Zalo actions follow selected branch; mobile bottom bar = **Trang chủ / Gọi ngay / Zalo / Tư vấn / Menu**.
6. SEO: SSR/ISR as appropriate, Metadata API, structured data from verified facts, canonical, robots, sitemap, redirects, Web Vitals. No guaranteed Google ranking/indexing.
7. Hashtags: auto-suggest from validated content, editorial review, persist via backend SEO metadata; do not keyword-stuff.
8. Indexing: event-driven sitemap/revalidation, Search Console observation, IndexNow only for participating engines. Do not misuse Google's restricted Indexing API.
9. Loading: no unnecessary full-screen spinner, no LCP delay, skeleton/streaming where useful, branded splash only for exceptional cold-start contexts.

## Deliverables
Next.js source, generated API client, design tokens, route/component map, asset manifest, CMS mapping, SEO/indexing integration plan, loading states, tests, Playwright screenshots/diffs, performance and accessibility reports, environment example, deployment guide, and open issues. **This ZIP contains prompts/references, not an implemented website.**
