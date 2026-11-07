# 11 — Technical SEO and content SEO requirements

## Target: excellent technical implementation, no rank guarantee
Aim for **Lighthouse SEO >=95** on representative public routes and correct crawlability. Search ranking and indexing are Google decisions and cannot be guaranteed by code. Document lab vs field data.

## On-page and metadata
1. Every published route has unique useful title, description, one primary H1, correct canonical, locale `vi-VN`, OG/Twitter image, descriptive media alt, internal breadcrumbs and relevant internal links. Metadata comes from CMS; fallback is site-wide CMS configuration, not invented product claims.
2. Next `generateMetadata` loads server-side SEO metadata for product/project/article/solution/page; avoid duplicate network calls via appropriate memoization/caching.
3. Use `metadataBase`, absolute canonical URL and stable OG image. Handle 404, redirects, unpublished, drafts, preview and pagination correctly.
4. Structured data: `Organization` and `LocalBusiness` only with verified business details; `Product` only with real product facts (omit price/ratings if absent); `Article`/`BlogPosting` with actual dates/authors; `BreadcrumbList` consistent with links. Do not output misleading FAQ/review schema.
5. Canonical slugs come from backend; slug changes require 301 redirects, internal link updates and sitemap changes. No automatic slug change for an already published URL without redirect.
6. No arbitrary `meta keywords` stuffing. Keywords and hashtags are editorial aids; hashtags are for social distribution, not a direct Google ranking factor.
7. Category and filter routes: keep user-visible filters shareable, but avoid indexable combinatorial parameter URLs. Only intentional high-value landing pages receive indexable canonical URLs; other filter variants canonicalize appropriately or use `noindex` based on SEO policy. Do not block important content with robots if noindex must be crawled.
8. Paginated distinct pages should not all blindly canonicalize to page 1; set self-canonical for genuinely distinct indexable pages or follow explicit noindex policy.
9. Article content: fact-grounded, unique, useful, readable, author/editor workflow, update timestamps reflecting substantive changes, no mass-generated doorway pages.

## Sitemap and robots
- `app/sitemap.ts` or segmented sitemap index reads only published canonical URLs from backend; `lastModified` is actual content modification timestamp, not current time on every request. Max 50,000 URLs / 50 MB uncompressed per sitemap; paginate/partition if needed.
- `app/robots.ts` links sitemap; disallow administrative/private routes appropriately; use meta robots/noindex for previews and unpublished paths as necessary. Never accidentally `Disallow: /` in production.
- One canonical sitemap owner (Next.js or NestJS), not two conflicting URLs. Recommended: Next.js exposes `/sitemap.xml` from backend published URL feed; backend owns content publication and change events.
- Validate canonical domain, http→https redirect, trailing slash policy, `www`/non-www choice, redirect loops, broken links, soft 404 and mobile content parity.

## Crawlable rendering
- Main page body and product/article descriptions must appear in initial server-rendered HTML; do not require JS click to reveal the only meaningful content.
- Header/footer links are semantic anchors; content cards have descriptive link text; filters use real URLs; JSON-LD is server-rendered and validated.
- Loading skeleton must not be the only HTML delivered to bots for public detail pages; ensure streaming resolves content normally.

## Media SEO
- Hero image `next/image` with measured `priority`/`preload` strategy for actual LCP, responsive `sizes` and mobile art direction where supported; lazy-load below fold.
- Video uses a real asset, poster, captions/transcript when available, no autoplay with sound, lazy-load player, and `VideoObject` only when facts/asset qualify.
- Alt text describes actual visible media, not stuffed keywords. Filename/captions meaningful, generated only from verified facts.

## KPIs and audit
- LCP <=2.5s, INP <=200ms, CLS <=0.1 at 75th percentile real-user data; Lighthouse SEO >=95, Accessibility >=95 target in stable CI. No invented pass results.
- Measure crawl/index coverage, organic landing-page impressions/clicks/CTR, duplicate titles/canonicals, broken links, sitemap URL count, indexed vs eligible status (Search Console observation only).
- Use Google Search Central official guidance: https://developers.google.com/search/docs/fundamentals/seo-starter-guide ; https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap ; https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
