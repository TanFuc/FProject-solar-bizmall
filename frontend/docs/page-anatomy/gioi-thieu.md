# /gioi-thieu — anatomy and content contract

Reference: `BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/BM_SOLAR_gioi-thieu_{desktop,mobile}.png`. Reference images are read-only comparison material and are not page backgrounds or cropped card assets.

## Render sequence

Hero; breadcrumb; story with illustration; vision/mission/values; ecosystem photo cards; four-step process; three-image gallery; consultation CTA; footer.

## Content ownership

- CMS page key: `about`. Published page API: `/api/v1/public/pages/about`.
- Hero fields and media IDs: `seed_visual_v3_hero`; media gallery: `seed_visual_v3_media`; editable prose: `seed_visual_v3_copy.data.copy`.
- Seed input: `backend/seed-assets/visual-v3/manifest.json`; runtime consumes the published backend response, not this file directly.
- Product, audience, category, brand, project and article records come from their public API endpoints. Branch contacts, logo, footer links and legal text come from site-shell/database.
- Admin: `/admin/media` edits hero/prose, uploads media, saves a revision and publishes; shared-media replacements are reversible. Existing user authentication is required.
- Structural labels, icons, route definitions and layout are code. This change does not claim an arbitrary-page visual builder or a completed replacement of the older admin dashboard.

## Responsive behavior and evidence

Desktop reference width 1440; mobile reference width 390. Home references have non-browser dimensions and require approximate normalized comparisons. Checks also cover 360 and 768 widths. Raw captures and actual DOM measurements are under `visual-qa/final`; see `visual-qa/report.md` for capture limitations and exceptions.

## Acceptance constraints

Preserve real published record counts. Do not duplicate articles/projects, manufacture statistics, claim an illustration is a completed project photograph, or report a screenshot match solely from successful source edits. All newly generated photos are replaceable illustrative seed media stored in R2 and registered in the local database.
