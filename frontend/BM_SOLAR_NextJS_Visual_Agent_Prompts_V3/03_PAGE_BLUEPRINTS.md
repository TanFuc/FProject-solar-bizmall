# Page-by-page visual blueprint

Each page must inherit the shared shell (utility bar on desktop, logo/nav, footer, branch selection, contact actions) and load its layout/content from CMS blocks. The storyboard indicates 12 screen states, not only 12 URLs.

## 01 Home `/`
Full-bleed solar-home cinematic hero, left text overlay, two CTAs, slider controls; curved white category strip with **5 equipment categories** (solar modules, storage/BESS, inverter, EV charger, equipment/accessories); image-led solutions for home/business/factory; selected projects; featured products; brand intro; news; branch/contact CTA. Mobile: cropped hero, compact cards, persistent bottom nav.

## 02 About `/gioi-thieu`
Wide branded hero with showroom architecture image; image + short positioning statement; metrics only when CMS has verified values; brand pillars, ecosystem, branch network and trust signals. No invented project counts.

## 03 Solutions `/giai-phap`
Wide hero and 3 image-first solution cards: household, enterprise, factory. Solution detail route `/giai-phap/:slug` includes use cases, equipment, process, related products/projects and consultation CTA.

## 04 Product listing `/san-pham`
Wide product-category hero, category filter sidebar on desktop and drawer/chips on mobile, grid of product photos, category labels, optional brand and technical filters, sort, pagination, empty state. URL query params must represent filters.

## 05 Product detail `/san-pham/:slug`
Image gallery/thumbnails, name, brand/model, verified specs, PDF documents, product description, related solutions/projects, prominent quote CTA. Do not fabricate prices, stock or review stars. Structured Product schema only when appropriate data is present.

## 06 Project listing `/du-an`
Wide project hero with aerial solar imagery; filter by project type and region, image-first cards, region labels and technical summary only if known. Filter state reflected in URL.

## 07 Project detail `/du-an/:slug`
Large hero/gallery, project title, region, type, installed capacity (if verified), timeline and solution stack, project story, related products, lead CTA. Image captions and alt text editable in CMS.

## 08 News `/tin-tuc`
Editorial hero, category tabs/chips, prominent article imagery, card grid, date, category, pagination and search.

## 09 Article detail `/tin-tuc/:slug`
Readable article with image, title, byline/date when known, table of contents for long pieces, inline media, related articles, share links, metadata and Article structured data.

## 10 Contact `/lien-he`
Wide hero with service/customer-support photography; branch selector, per-branch address/contact/social channels, accessible lead form, location/map link if valid, feedback and success states.

## 11 Mobile menu (UI state)
Full-height or slide-out navigation with accessible close button, expandable categories, links and persistent Call/Zalo shortcuts. Focus trap if modal, escape to close, body scroll lock.

## 12 Mobile branch picker (UI state)
Branch list/cards with city, branch name, configured call and Zalo links, selected branch indication; selection persists in appropriate non-sensitive client state and updates all contact CTAs.

## Additional pages required by architecture
`/san-pham/danh-muc/:slug`, `/du-an/loai/:slug`, `/du-an/khu-vuc/:slug`, `/chi-nhanh/:slug`, `/tim-kiem`, `/chinh-sach-bao-mat`, `/404` as CMS/SEO and routing require. Do not invent page content. Use CMS configuration and route templates.


## V3 page-specific full-page reference mapping (mandatory)
Use `15_REFERENCE_MAP_AND_VISUAL_PRECEDENCE.md` for the exact image filenames and viewport/height. Do not use the old storyboard as the only source for any of these pages:
- Home `/`: `references/home-desktop-full.png` + `references/home-mobile-full.png`.
- About `/gioi-thieu`: `BM_SOLAR_gioi-thieu_{desktop,mobile}.png`.
- Solutions `/giai-phap`: `BM_SOLAR_giai-phap_{desktop,mobile}.png`.
- Products `/san-pham`: `BM_SOLAR_san-pham_{desktop,mobile}.png`.
- Projects `/du-an`: `BM_SOLAR_du-an_{desktop,mobile}.png`.
- News `/tin-tuc`: `BM_SOLAR_tin-tuc_{desktop,mobile}.png`.
- Contact `/lien-he`: `BM_SOLAR_lien-he_{desktop,mobile}.png`.

## Next.js route ownership
Use App Router route segments and server-side CMS resolver for page/block data; `generateMetadata` for each public detail route. Product/project/news filters must use URL search params and server-render the results for crawlability where appropriate. Unknown slugs and unpublished content return 404; preview is authenticated and `noindex`. No placeholder project claims, fake logos, fabricated specs, fake ratings or unverified phone numbers.
