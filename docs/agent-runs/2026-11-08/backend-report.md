# BM SOLAR Backend & API Client Usability Report

**Date**: 2026-11-08  
**Worker**: Implementation Worker (Backend & API Client)  
**Target Binary**: `bin/bmsolar-usability.exe`

---

## 1. Diagnosis

1. **API 429 Rate Limiter Bottleneck**:
   - The original rate limiter applied a global 10 req/s window keyed on `RemoteAddr`.
   - `cmd/server/main.go` previously mounted `chimw.RealIP` before the limiter, which allowed untrusted external `X-Forwarded-For` headers to overwrite `RemoteAddr`.
   - During Next.js SSR, all server-side component queries (`/site-shell`, `/pages/*`, `/products`, `/product-categories`) originated from `127.0.0.1`, rapidly consuming the shared 10 RPS limit.
   - Frontend `publicFetch` retried without jitter, inducing retry storms.
   - Previously, client fallbacks injected demo data, masking real failures and causing CMS revision/publishedAt type discrepancies.

2. **Logo White Box / Alpha Flattening**:
   - `media.SaveUploadedFile` unconditionally painted all decoded raster images onto an opaque white RGBA canvas and encoded to JPEG (`.jpg`).
   - The genuine transparent logo in `frontend/public/images/logo.png` was flattened into a white box, and all variant records were forced to `.jpg`.

---

## 2. Changes Implemented

### Backend (`backend/**`)
1. **Network Layer & Peer Verification** (`backend/cmd/server/main.go`):
   - Removed `chimw.RealIP` from the global middleware chain. `r.RemoteAddr` remains the direct TCP peer socket address, preventing remote client header spoofing.
2. **Scoped Rate Limiter** (`backend/internal/common/middleware/ratelimit.go`):
   - **Trusted Peer Scoping**: Direct external connections never trust `X-Forwarded-For` or `X-Real-IP`. Only verified loopback addresses (`127.0.0.1`, `::1`) can forward visitor IPs for SSR.
   - **Order of Evaluation**: Sensitive write/auth/leads routes are evaluated **first** before checking loopback status, ensuring loopback callers cannot flood auth or CRM endpoints.
   - **Fixed-Window Quotas (Separate Budgets)**:
     - `ScopeAuth` (`/api/v1/admin/auth/*`): 5 RPS, burst 10 (brute-force defense on actual registered routes).
     - `ScopeLeads` (`POST /api/v1/public/leads`): 3 RPS, burst 6 (CRM spam flood defense).
     - `ScopeMutation` (POST/PUT/PATCH/DELETE): 15 RPS, burst 25.
     - `ScopeSSRRead` (trusted Next.js SSR loopback GETs): 120 RPS, burst 200.
     - `ScopePublicRead` (general external GETs): 40 RPS, burst 80.
   - Standard headers emitted: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After: 1`.
3. **Media Transparency Preservation** (`backend/internal/modules/media/media.go`):
   - Implemented `imageHasAlpha(img image.Image) bool`.
   - Transparent PNGs/WebPs bypass white background compositing and are encoded via `png.Encode` (`image/png`, `.png`).
   - Responsive variants (`thumb`, `medium`, `large`) preserve PNG format, transparent alpha, dimensions, and `.png` keys. Opaque images retain JPEG optimization.
4. **Seed Update for Genuine Transparent Logo** (`backend/cmd/seed-visual/main.go`):
   - Ingests genuine original transparent PNG from `frontend/public/images/logo.png`.
   - Distinctly registers asset as `seed-visual-v3-logo-transparent.png`.
   - Replaces `SiteSetting.logo_media_id` only if currently seed-owned (`seed-*`), strictly preserving administrator-owned custom overrides.
5. **Backend Test Suites**:
   - `backend/internal/common/middleware/ratelimit_test.go`: Tests real registered auth path `/api/v1/admin/auth/login`, loopback auth strict limiting, lead spam blocking, SSR read burst, and external spoofed XFF rejection.
   - `backend/test/alpha_persistence_test.go`: Tests transparent PNG upload, verifying alpha is preserved (corner alpha 0, no white compositing) across master and all variants.

### Frontend (`frontend/src/lib/api/**`, `frontend/tests/**`)
1. **Removal of Hardcoded Demo Fallbacks** (`frontend/src/lib/api/client.ts`):
   - Removed `fallbackSiteShell`, `fallbackHomePage`, and fake page records.
   - `getSiteShell()` and `getPageBySlug()` throw actual typed public API errors on failure, allowing root layout / Next.js error boundaries to present a truthful retry UI.
2. **Strict Typing (No `any`)**:
   - `getProductCategories(): Promise<ProductCategoryItem[]>`
   - `getAudiences(): Promise<AudienceItem[]>`
   - `getBrands(): Promise<BrandSummary[]>`
   - `getProjectTypes()`, `getProvinces()`, `getArticleTags()` typed as `Promise<{ value: string; label: string }[]>`.
   - Fixes implicit-any compile errors across consuming pages.
3. **In-Flight De-duplication & Bounded Cache**:
   - Concurrent identical GET requests share in-flight promises via `inFlightRequests` with safe cloning (`res.clone()`) and handled cleanup (`.catch(() => {}).finally(...)`).
   - Bounded cache (`stableCache`, 30s TTL) strictly reserved for shared catalog metadata; CMS pages and SiteShell rely strictly on in-flight de-duplication per render.
   - Failures (HTTP 429/500) and credentials are never cached.
   - Query isolation: full URL including query string is used for keys.
   - Jittered exponential backoff prevents retry storms.
4. **Cache Invalidation Export & Route Integration Guidance**:
   - Exported `invalidatePublicCache(pattern?: string)`.
   - *Guidance for Parent / Route Handlers*: Call `invalidatePublicCache('meta:product-categories')` or `invalidatePublicCache()` upon receiving CMS publish/webhook events to purge stale catalog entries and cancel matching in-flight requests.
5. **Frontend Public Data Test Suite** (`frontend/tests/public-data.test.ts`):
   - Verifies truthful failure without demo data for `getSiteShell()` and `getPageBySlug()`.
   - Tests concurrent GET de-duplication (3 concurrent calls -> 1 HTTP fetch).
   - Tests query parameter isolation.
   - Tests 429 retry recovery with `Retry-After`.

---

## 3. Parent Execution Guide (Windows Environment)

Parent runner should execute the following commands in order on the Windows environment:

1. **Compile Backend Binary**:
   ```cmd
   cd backend
   go build -o bin/bmsolar-usability.exe ./cmd/server
   ```
2. **Execute Seed for Transparent Logo (Local SQLite)**:
   ```cmd
   cd backend
   go run ./cmd/seed-visual
   ```
   *Output*: Ingests `frontend/public/images/logo.png`, writes `seed-visual-v3-logo-transparent.png`, updates `SiteSetting.logo_media_id`, and logs new asset ID and URL.
3. **Execute Test Verification**:
   ```cmd
   cd backend
   go test -v ./internal/common/middleware ./test -run "TestRateLimiter|TestAlphaPersistence"
   go test ./...

   cd ../frontend
   npm run test:public
   npm run typecheck
   ```

---

## 4. Coordination & Safety Notes

- **Error Boundary Coordination**: With demo fallbacks removed, root-layout and route error boundaries (`error.tsx`, owned by UI worker) will truthfully catch network/rate-limit errors and provide the retry mechanism without rendering misleading demo content.
- **Server Processes**: No servers were stopped or restarted; no environment variables were altered.
