# 15 — Exact image mapping and visual authority

## How to read references
These are **design images** of complete pages, not browser screenshots or deployable assets. They show layout and visual hierarchy but may contain invented text, logos, product models or metrics. Recreate the UI in semantic Next.js components, using real CMS media, and document discrepancies. Do not embed reference image as a rendered page.

## Page-to-image mapping
| Route | Desktop full page | Mobile full page |
|---|---|---|
| `/` | `references/home-desktop-full.png` | `references/home-mobile-full.png` |
| `/gioi-thieu` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_gioi-thieu_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_gioi-thieu_mobile.png` |
| `/giai-phap` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_giai-phap_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_giai-phap_mobile.png` |
| `/san-pham` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_san-pham_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_san-pham_mobile.png` |
| `/du-an` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_du-an_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_du-an_mobile.png` |
| `/tin-tuc` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_tin-tuc_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_tin-tuc_mobile.png` |
| `/lien-he` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_lien-he_desktop.png` | `BM_SOLAR_Full_Page_Designs/BM_SOLAR_lien-he_mobile.png` |

## Loading reference mapping
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_loading_icon.svg` (SVG concept)
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_loading_icon.gif` (animation reference)
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_loading_icon.png` (static fallback)
- `BM_SOLAR_Full_Page_Designs/BM_SOLAR_loading_screen_desktop.png` and `_mobile.png` (composition references)

## Supplementary images
- `references/contact-desktop-supplement.jpg`, `references/contact-mobile-supplement.jpg`: optional contact page supplementary designs. If inconsistent with main `BM_SOLAR_lien-he_*`, default to main full-page references and flag conflict for approval.
- `references/hero-desktop-mobile.png`, `references/all-pages-storyboard.png`: legacy only; never override the new home and six full-page designs.

## Measured image dimensions
- Home latest desktop: 1024×1536 image pixels; latest mobile: 724×2172 image pixels. These are NOT calibrated 1440/390 browser screenshots; compare by aligned normalized regions.
- Six-page desktop designs: 1440px wide, full-height per page. Six-page mobile designs: 390px wide, full-height per page. Run full-page screenshot comparison at matching CSS widths.

## Mandatory per-page inspection output
For each page create a `page-anatomy/<slug>.md` listing: section sequence from header to footer, container width, approximate pixel dimensions, image aspect/crop, typography, card counts, CTAs, sticky actions, responsive layout differences, CMS block type and uncertainty level.

## Precedence conflict resolution
1. Security and verified backend facts cannot be overridden by AI-generated text in images.
2. For **visual** differences, latest page-specific reference beats legacy storyboard and old prompts.
3. For **data/SEO**, current NestJS OpenAPI and published CMS data beat reference screenshots.
4. For unseen states/detail routes, use design tokens and reusable components; record assumptions and ask for confirmation if a major new layout is required.
