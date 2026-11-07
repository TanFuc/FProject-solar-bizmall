# Local visual remediation and backend verification

Status: implemented and tested locally; **not a certified 100% pixel match**. No production deployment was performed. The future production origin is not used as the current backend.

## Running environment

- Website: http://localhost:3000/
- Media/content administration: http://localhost:3000/admin/media
- Backend: http://localhost:3001/api/v1
- Local database: backend/bmsolar.db. Seed creates timestamped SQLite backups in backend/storage.
- Images: real uploads to the user-authorized R2 bucket and public image domain; IDs and storage keys are persisted in SQLite. Secrets remain in ignored environment files and are omitted from this report.

## Changes

Seven page templates now read hero/prose/media from published CMS data. About/solutions retain authored semantic layouts while removing the design-crop photo dependencies. New generated house, factory, office and EV photographs and generic device illustrations are seeded as media; admin can replace them. Logo conversion now composites transparent pixels onto white before JPEG encoding.

Products/projects/news use actual API records and result counts, filters and links. Demo catalog records are no longer substituted on API failure. Detail cover URL mapping was corrected. Footer contacts, logo and navigation use stored data. Search now performs a real product query; mobile branch labels and call/Zalo destinations were corrected. Lead forms report success only after the backend returns a saved reference code.

A real admin media page supports authenticated upload, page prose/hero editing, revision publication and reversible shared-image replacement. The two pre-existing ProcessFiveSteps/JourneyCtaBanner source files were preserved; CMS-backed sections are used in the revised page templates.

## Executed checks

- Frontend TypeScript check passed.
- Frontend test suites passed: SEO, existing matrix, i18n, and added public DTO/lead acknowledgement regression tests. These are code tests, not a substitute for browser evidence.
- Optimized frontend build passed using the local backend override and a separate build directory. CMS pages render dynamically; the preview development output is not overwritten by the build.
- `go test ./...` passed. Image unit tests verify actual variant sizes, rejected oversized input, failure on invalid R2 configuration, and white transparency matte.
- Opt-in local integration test passed: unauthenticated upload 401; authenticated upload 201; registered asset and three real resized variants; public R2 image GET 200; QA-page publication with media ID hydration; replacement validation; replacement updates public URL and ETag; restore original; restricted session denied 403. Test-only pages are unpublished during cleanup. No user/password reset or new administrator was created.
- Browser: seven routes checked at 1440x900 and 390x844; supplementary 360x800 and 768x1024 checks found zero document horizontal overflow, one h1 per page and no visible unnamed buttons in the measured default states.
- Browser search for Deye returned four actual products; sorting updated the URL while preserving the search term. Mobile menu showed distinct branch names; selecting Gò Vấp updated the call link to the stored branch phone.
- Browser email-contact form returned “Yêu cầu của bạn đã được ghi nhận.” A read-only database query confirmed exactly one QA row for the reserved `.invalid` test address and `/tin-tuc#newsletter`. This verifies CRM capture, not newsletter delivery.

## Screenshot method and limitations

Raw viewport JPEGs and measurements are in `visual-qa/final`. `narrow-checks.json` contains the 360/768 measurements. Screenshots from this in-app browser are slightly rescaled native JPEGs, not pixel-exact Playwright PNGs. The documented full-page capture call failed. Experimental stitched `actual.png`/`diff.png` artifacts contain normalization and, in earlier mobile passes, missing/overlapping strips; they are **diagnostic only and must not be used as exact-match acceptance evidence**. Capture attempts and source images are retained rather than represented as clean full-page proof.

The desktop comparison images are useful for section order and broad geometry. No SSIM score or “100%” percentage is asserted. Reference PNGs remain unchanged. Use the current website and final viewport proof for the actual running result.

## Remaining differences and unverified scope

- Generated photos resemble the requested scene but differ from the design pixels. Real manufacturer product photographs were not supplied; the equipment images are explicitly generic illustrations.
- Published data currently contains 6 products, 3 projects and 2 articles. The reference layouts contain more projects/articles; empty records were not fabricated to match their height.
- Typography, logo composition, some spacing/crops, footer density and reference-only controls still differ. The home mobile reference is not a calibrated 390px screenshot.
- Admin API upload/publication/replacement was tested with the existing local administrator's short-lived test session. The browser admin page remains at sign-in: no interactive authenticated admin upload/edit session was completed as the user explicitly chose to continue checks that do not require browser sign-in.
- This does not certify all legacy detail-page prose or the older dashboard as completely CMS-driven; arbitrary new public page creation/layout editing remains separate from these seven templates.
- Manual semantics and interactions were checked; an automated axe audit was not executed. No production readiness or deployment claim is made.

## Maintenance

Use the current admin media route to upload and replace images. Seed is restricted to local SQLite development, reuses registered assets and preserves administrator-owned published revisions; do not treat rerunning a seed as a production migration. Preserve image IDs in references and resolve storage URLs through the media service. Keep Antigravity or another editor from concurrently rewriting the same routes; concurrent source versions were backed up under `visual-qa/concurrent-source`.


User steering confirmed on 2026-11-08 (Asia/Saigon): Antigravity paused; continue checks without browser admin login. Final running website proof: `final/home-proof.jpg`. Temporary browser viewport overrides were reset.
