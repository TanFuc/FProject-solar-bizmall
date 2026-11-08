# BM SOLAR — usability, 429, branding and SEO handoff

Date: 2026-11-08 (Asia/Saigon). Local project only. No production deployment, commit or push.

## Actual execution and model routing

Implementation was delegated to native Antigravity CLI Gemini workers with separate ownership: backend/API, UI, SEO/compatibility. `execution-receipts.json` records actual conversation IDs and successful CLI outcomes. Gemini CLI was attempted with the existing personal OAuth login, but Google returned `IneligibleTierError` and directed migration to Antigravity; no API key or ChatGPT fallback was substituted.

The active AgentHub configuration is `/home/tanfuc/AgentHub/workflow/team.json` in Ubuntu WSL. Coordinator/reviewer use Gemini Flash Medium; worker uses Flash High, Gemini Low fallback, automatic OAuth/ChatGPT fallback disabled. The nine role/tier routing tests passed. Actual execution guidance limits environment probes, reuses check evidence, avoids Windows/WSL dependency installation loops and idle quota polling. The Windows AgentHub directory is a legacy backup. These particular implementation jobs were direct CLI jobs, not fabricated Paperclip dashboard tickets.

## 429 diagnosis and remediation

The original global fixed 10 requests/second bucket counted site-shell, page metadata, catalog reads, prefetch, login and writes together. Multiple Next SSR requests shared loopback identity, so a few page clicks could exhaust the same bucket.

Backend now separates fixed-window budgets for public/SSR reads, actual `/api/v1/admin/auth/*` endpoints, lead submissions and mutations. Public reads tolerate bursts; auth/writes remain limited. Unconditional RealIP rewriting was removed so untrusted external forwarded headers cannot bypass peer identification. Tests cover external header spoofing and strict sensitive endpoints, including loopback auth.

Frontend GETs are coalesced in flight, query-specific requests remain isolated, and only stable public catalog metadata has bounded memory caching. CMS pages/site-shell use live data without fake demo fallbacks. Failed requests are not cached. Invalidation has a generation guard, authenticated revalidation clears public cache, and unconfigured revalidation refuses requests instead of accepting a hardcoded secret. Recovery UI handles actual errors truthfully.

`rate-and-logo-check.json`: 100 local public GET requests, all HTTP 200, no 429. This is a local burst check, not an unlimited-load guarantee.

## Branding and interface

Transparent original PNG was preserved through upload and all resized variants. Corrected resizing to interpolate alpha instead of forcing opacity. Newly registered seed-owned logo is bound by media ID in SQLite/R2; custom administrator logos remain protected. Original and thumbnail public R2 responses both tested HTTP 200, PNG alpha present, transparent pixels preserved.

Header/footer/drawer use the CMS logo with transparent wrappers; duplicate wordmark text was removed. Browser tab icon, apple icon and web manifest are present and reachable. No logo redraw was used.

Mobile drawer opens from the right, has entrance/exit motion, backdrop, Escape handling, focus trap/restore, body scroll lock and a single shared instance for header/bottom navigation. Native browser observation confirmed the right-side panel, exactly one dialog, body scroll lock, successful Escape dismissal and focus returning to the menu trigger. Screenshot: `menu-right.jpg`.

Category/filter/sort navigation code now uses client router transitions with `scroll:false`, query preservation and pagination reset. Navigation progress starts before navigation and clears on route commit/error/recovery; no invented percentage timer. Catalog pending feedback reserves a stable slot; skeleton and retry states were added. Motion targets interactions and supports reduced-motion static feedback; content is not hidden pending JavaScript scroll reveals.

**Browser limitation:** during filter testing in the in-app browser, the selected value changed and server query requests completed, but URL/result commit was not conclusively verified there. Cross-checking native Chrome was then blocked by the computer-use tool because it could not establish the current URL confidently. No browser actions were attempted after that block. The final React/Next upgrade and subsequent integration fixes therefore have HTTP/code-test coverage, not a completed final interactive Chrome acceptance test. Do not claim all clicks/scroll behavior were verified.

## SEO and dependencies

Canonical/title deduplication, CMS-grounded Organization/branch data, OG/Twitter metadata, actual-record sitemap, favicon, apple icon and manifest were reviewed. Removed copied branch constants, invented postcodes, unsupported inventory Offers and fabricated publication/build timestamps. Robots allows static rendering assets; admin and filtered/search URLs are noindex. Missing detail records now explicitly use noindex and a recoverable not-found page. JSON-LD escapes `<` to prevent editable content closing the script tag.

Updated Next 14 to Next 15.5.29, React/React DOM 19.3.1 and matching types, PostCSS 8.5.32 with a consistent dependency override. Async route params/searchParams were migrated. `dependency-audit-final.json` records zero npm audit findings at check time; this is not a security certification.

Official migration guidance: https://nextjs.org/docs/app/guides/upgrading/version-15
Next Windows security advisory: https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36

## Integrated checks

- `go test ./...`: passed, including limiter and transparent image variant tests.
- Frontend TypeScript check: passed.
- SEO, matrix, i18n and public API/lead tests: passed. Repeated only affected suites after corresponding integration fixes.
- Optimized production build against local backend: passed (separate `.next-usability-build`, no deployment).
- HTTP audit: 27 routes, including seven roots, actual product/project/article details, solution routes, filters, admin and missing-record path. No 500/429/runtime-error responses; no dead internal links found in this crawl. Robots/sitemap/favicon/apple icon/manifest returned 200. `http-audit.json` contains per-route evidence. Streaming Next missing pages may return 200 with noindex; do not equate the crawl with a full interactive user test.
- Genuine transparent logo and thumbnail: public R2 alpha validation passed.
- No interactive admin sign-in was performed; the user's preference to continue without login remains respected.

## Current local runtime

Website: http://localhost:3000/ (bound to 127.0.0.1:3000).
Backend: http://localhost:3001/api/v1, running `backend/bin/bmsolar-usability.exe`.
Admin media: http://localhost:3000/admin/media.
Backend/local env and production-future env files remain ignored by Git; secrets are absent from this report. `CMS_REVALIDATE_SECRET` must be configured privately before enabling the revalidation webhook. Generated photos and current published record counts remain the same; no claim of 100% reference-image fidelity or production readiness is made.
