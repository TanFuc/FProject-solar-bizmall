# 08 — Prompts for staged coding agents

## Agent 0 — Visual/reference auditor
Read `AGENTS.md`, all docs and **all 14 desktop/mobile page reference images**, loading references, and latest user-provided contact supplements. Create per-page full-scroll section inventory, pixel measurements, component hierarchy, responsive mapping, asset requirements, uncertainties and design precedence report. Do not code yet.

## Agent 1 — Next.js foundation and global shell
Set up Next.js App Router + strict TS, pin versions, create `app/layout.tsx`, fonts, CSS tokens, typed CMS API client and runtime validation. Implement topbar/header/footer and fixed mobile bottom nav with Home/Call/Zalo/Consultation/Menu; branch-specific links from CMS. Compare 1440 and 390 screenshots before continuing.

## Agent 2 — Home page (visual gate)
Implement all sections from `references/home-desktop-full.png` and `references/home-mobile-full.png`: hero, category strip, 3 audience cards, products, projects, trust, news, partners, consultation and footer. All content CMS-driven. Take full-page screenshots, compare section by section, fix mismatches; no next page until home approved.

## Agent 3 — Six page families
Implement About, Solutions, Products, Projects, News, Contact using the exact corresponding files in `BM_SOLAR_Full_Page_Designs/`. Build detail routes and filtering states. Each page gets desktop/mobile full-page screenshots and visual QA report.

## Agent 4 — SEO and hashtag workflow
Implement Next Metadata API, `robots.ts`, `sitemap.ts`, JSON-LD from published facts, canonical, redirects, search filter URL policy. In admin workflow, call `POST /admin/seo/suggest`, display keywords/tag/hashtag suggestions, let editor approve, persist with `PATCH /admin/seo-metadata/{resourceType}/{resourceId}`. Test Vietnamese token normalization and duplicates. No keyword stuffing or invented data.

## Agent 5 — Indexing/revalidation integration
Design and implement authenticated Next.js cache revalidation endpoint for NestJS publish events. Define event payload and replay protection. Connect backend event queue, sitemap refresh and optional GSC sitemap monitoring according to backend contract; no Google Indexing API for generic pages. Report missing backend APIs rather than faking them.

## Agent 6 — Loading, Core Web Vitals, global optimization
Build branded lightweight SVG/CSS loading icon from supplied references, route-level skeletons, Suspense boundaries and proper errors. Optimize hero LCP, `next/image`, `next/font`, video poster, JS splitting, cache and image crops. Measure field/lab metrics; eliminate blocking splash.

## Agent 7 — Final QA and delivery
Run strict typecheck, lint, unit tests, API contract tests, E2E, axe, screenshot regression for all pages, SEO crawl and performance audits. Provide actual commands, results, screenshot/diff files, unresolved issues, CMS endpoints and production deployment checklist. Never claim 100% fidelity or top Google rankings.
