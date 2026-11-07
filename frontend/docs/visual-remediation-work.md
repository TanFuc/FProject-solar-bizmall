# Visual remediation — active working context

Workspace: C:\Users\Local_2\OneDrive\Desktop\Project-NEW\FProject-solar-bizmall
Task: compare frontend against frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3 and repair all seven public pages, desktop/mobile. Do not claim 100% without evidence. Main home refs references/home-desktop-full.png (1024x1536), home-mobile-full.png (724x2172); six page refs nested BM_SOLAR_Full_Page_Designs (desktop1440/mobile390). Photos in originals are synthetic and not separate source assets.

User authorized generating illustrations, uploading/seed through local Go backend and saving R2 settings. User clarified production solar.bizmallgroup.com is future ONLY: test local backend, do not deploy. Production configs are in ignored frontend/.env.production.local and backend/.env.production.local; actual backend/.env merged R2 settings, preserving DB/JWT; local CORS includes localhost3000. Frontend .env.local retains localhost3001 API and image domain. NEVER print or commit secret env values.

Original uncommitted user/Antigravity changes: frontend/src/components/blocks/JourneyCtaBanner.tsx, ProcessFiveSteps.tsx. Preserve. Copies in frontend/visual-qa/*.before.tsx.txt. Do not modify these two files without preserving original edits.

Runtime: frontend Next dev3000 original Windows node PID22348; backend original go-run child11268 stopped after verification, replaced with backend/bin/bmsolar-visual.exe hidden. Logs backend/storage/visual-server.{stdout,stderr}.log. Backend built from current code except later pending changes may require rebuild/restart. Go runtime works Windows go1.27. WSL distro Ubuntu usertanfuc Python3 exists; Windows python does not. Script paths /mnt/c/Users/Local_2/AgentHub/solar-*.py; all edits under canonical repo.

Done:
- Read reference map, QA guide, design tokens, pack AGENTS; backend AGENTS. Read local Sites skill for local-only edits, no hosting needed. Read imagegen skill; used builtin generator.
- Baseline actual screenshot frontend/visual-qa/before/home-desktop.jpg via CUA.
- Found hero API returned only mediaID and frontend passed undefined src. Backend public catalog assembled URLs from IDs rather than storage keys; FE expected coverMediaUrl while BE returns coverUrl. Published APIs only have 6 products,3 projects,2 articles; old page templates invented their own static product/project/article arrays.
- Rebuilt HeroCarousel (real slides/controls, conditional image), compact CategoryStrip, SolutionShowcase, FeaturedProducts. New home order hero/categories/solutions/products/projects/benefit strip/news/form, removed extra process/journey (original components untouched).
- Scoped geometry/CSS appended globals.css; all six page roots tagged solar-page-<slug>, heroes solar-page-hero. Root body solar-site. Uses next/font actual Inter variable.
- New FE lib/api/blocks.ts guards; public-adapters.ts normalizes real product/project/article DTOs; client.ts normalizes API base /api/v1, no-store via revalidate0 in development; added getProductCategories/getAudiences. Network failure submitting lead now returns success:false (old code faked success).
- Home fetches actual CMS and catalog APIs, respects categoryIds from CMS, no any[] casts left in home.
- New VisualImage structural fallback; lib/api/visuals.ts getPageVisuals reads hero and gallery item URLs. All six page hero images/headlines and static image references now from CMS. About/solutions layouts preserved. Products/projects/news static invented arrays replaced with actual API records and taxonomy tabs derived from those records. These data adapters mean fewer cards than reference: must document, never duplicate fake content.
- Generated 4 photos (home/family/solar roof, factory, office, EV pavilion) and 5 native SVG equipment illustrations, plus copied actual logo to backend/seed-assets/visual-v3. Inputs and text manifest.json are editable seed data. Images are illustrative, not real completed-project photography.
- Backend media.SaveUploadedFile now checks actual bytes/limits, encodes JPEG with configured max dimensions/quality, writes actual resized thumb/medium/large variants, persists correct dimensions/sizes, fails on R2 errors. No longer labels copies as resized images. API upload DB writes atomic. Added Go tests media_test.go: real JPEG variants actual dimensions, R2 missing config failure, oversize rejection. Passed.
- New media.ResolvePublicURL(db,cfg,id) resolves ready MediaAsset storage_key. Catalog/projects/editorial cover URLs and CMS Hero hydration use it. Categories/audiences public DTO include imageUrl. CMS gallery items also hydrate from mediaIDs. HeroSlide AccentPhrase supported.
- New backend/cmd/seed-visual, local SQLite-only seeder. Uploads through actual media service to R2, registers MediaAsset/variants, backs up SQLite via VACUUM INTO, appends immutable published page revisions with audit entry (preserves older revisions). Creates seven CMS pages and hero/gallery data. Catalog and audience bindings fill missing/nonexistent image references; valid existing admin media preserved. Five canonical categories selected in home CMS. Run twice successfully, no duplicate assets.
- R2 uploads all10 successful. Public hero GET confirmed HTTP200,348391bytes. IDs/URLs are public safe:
 home 01M6TP4KD9HNRWYKZ9QNKGBAKH.jpg
 factory 01M6TP4PS6300GAMM6GRHVDX58.jpg
 office 01M6TP4SJEJ2Y7W113MJEYB031.jpg
 ev 01M6TP4VY5Z57SZ379ZKDEVH0E.jpg
 panel 01M6TP4Z8BGZJMB5V7A4FM0YX6.svg
 inverter 01M6TP4ZM6XVKRNMAE9MCBFVDW.svg
 battery 01M6TP5031281Q0TKSKYR92ECC.svg
 charger 01M6TP50F5PYY0XGYQ9J4W4BX4.svg
 electrical 01M6TP511WF8R11AM5WPFH3BFR.svg
 logo 01M6TP51E7J4X3ZXG45X7EEC01.jpg
 Public domain https://images.bizmallgroup.com/
- FE Next config allows images.bizmallgroup.com. Typecheck last passed after all six page media/data changes. Go targeted modules compiled and tests passed.

CUA:
 session bindings solarTab at localhost3000, solarBrowser IAB, solarFs fs. Viewport currently1440x900. CUA completion_summary NOT yet called for this task; must call only when final CUA outcome verified, nexttool before otherwork/final. Read rewriteDocumentation first after summary/compaction. Last screenshot showed root real R2 hero correctly, 5 category strip,3 audience photo cards. Home document height2897 vs normalized reference~2160; needs footer/form compacting. Initial photo source now shows all expected frontend R2 images. Current screenshot hero title wraps wrong; seed title needs explicit newline, CSS whitespace preline; reference headline first 'Giải pháp', second 'Năng lượng xanh', third orange 'toàn diện'.

Remaining:
1 Refine home hero with CMS-backed brand/benefit trio and proper line breaks; currently title wraps badly. Main reference has brand, three benefit icons, controls, two CTAs. Do not fake video where none supplied.
2 Category icons currently by array index; change to semantic slug matching. Existing duplicates in DB retained; homepage shows exactly canonical5 from seed.
3 Root partner/brand strip missing. Can add public brands DTO endpoint from actual brands DB and component; never hardcode manufacturer names. No actual brand logos currently supplied; document text wordmark approximation or support upload.
4 Header/footer logo square appears tiny; needs genuine CMS logo setting/props and horizontal composition. TopBar compares missing branch.code, shows both branches as Gò Vấp; use real branch.name. Header/fonts/hero sizing and footer compactness need refine.
5 Products page needs reference category icon strip + filter sidebar, actual filters; replace wrong ProcessFiveSteps section with audience solution tiles (preserve component file). Projects filters currently tabs actual types but select/search originally decorative must verify/fix. News reference featured layout large left +2 right (only2 actual posts), newsletter real form must not fake subscription success. Contact currently branch2 cards then large form; reference is3 contact action cards then form+branches side-by-side and FAQ. Use actual branches/channels data rather than hardcoded contacts. Page copy outside hero remains existing hardcode; don't claim full CMS admin done.
6 Home/project images currently seeded project round-robin caused a house project to get office illustration; choose by real ProjectType slug. Preserve valid existing admin media, only change assets from this seed. Could put explicit bindings in manifest and apply to seed-owned assets.
7 Admin currently fake static dashboard/mock leads. User specifically expects future image upload/replacement. Need real media manager route or integrate actual upload + page hero/gallery ID selection/publish using existing authenticated admin API; do not claim existing mock admin functional. Login credentials may be in existing seed code; don't print or reset existing user passwords. Could test with default local seeded credentials only if correct, no attempts loop.
8 Update OpenAPI contract/docs for optional hero accent/imageUrl category/audience, real variants. Meaningful FE adapter/media tests and existing npm test/typecheck/build. Build uses .env.production.local futuredomain unless override process NEXT_PUBLIC_API_BASE_URL=http://localhost:3001; do not accidentally fetch future domain. Leave production profile saved; local tests use local env override.
9 Write mandatory docs/page-anatomy/<route>.md, visual-qa/report.md with exact refmapping, source vs actual widths, status/missing data/assets. Capture all7desktop1440/mobile390 (+360/768 responsiveness) via CUA only. Existing shell Playwright scripts should NOT be used because browser control all via CUA. Generate comparison/diffs from saved screenshot image files using image analysis libraries (no website browser bypass), honest metrics only comparable aligned regions. User explicitly requested compare screenshots. Save screenshots embed final proof.
10 Verify actual backend upload API and public image fetch; unauth upload must401; validate forms no fake lead success. R2 originals uploaded via service/seed verified but API admin flow not yet end-to-end.
11 No Git commits/deploy requested. Preserve all existing edits. No secret outputs. Report no100% until measured; generated photos are approximate and real DB counts differ from synthetic refs. Continue until all feasible work complete, not stop at source reports.


## Local verification handoff — 2026-11-07

User clarified the production website is future-only. Local backend/R2 upload and CMS publication were exercised. See `visual-qa/report.md` for exact evidence and limitations; do not claim 100% fidelity, completed browser admin sign-in, or production deployment. Local backend runs `bin/bmsolar-local-ready.exe`; frontend dev remains on 3000. Original Antigravity baseline is commit 6e3244f; this task did not commit or push.
