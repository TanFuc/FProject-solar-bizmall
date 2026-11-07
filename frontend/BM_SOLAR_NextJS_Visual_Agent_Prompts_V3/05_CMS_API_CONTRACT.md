# CMS-driven frontend integration prompt

The backend is NestJS + TypeScript + MariaDB, modular monolith, with Public API, Admin CMS, and Lead Management. The frontend MUST consume documented public endpoints; do not assume these exact paths already exist. Reconcile this proposed mapping with the actual backend OpenAPI before implementation.

| UI | CMS/API resources |
|---|---|
| Global shell | site settings, branding, navigation menus, branches, contact channels, social profiles |
| Home hero and page sections | pages by slug, typed ordered page blocks, media assets |
| Solutions | audience segments, solution pages, linked products/projects |
| Product catalog | categories, products, specs, media, filter facets |
| Projects | project types, regions, projects, media galleries |
| News | article categories, articles, authors, SEO metadata |
| Contact | branches, branch channels, lead form config, lead creation |
| SEO | canonical, meta title/description, OG image, robots, schema.org, redirects |

## Recommended typed client
Generate TS types from OpenAPI; use explicit discriminated unions for CMS blocks: `hero`, `mediaGallery`, `categoryGrid`, `solutionCards`, `productGrid`, `projectGrid`, `richText`, `metrics`, `cta`, `video`, `faq`, `branchList`, `leadForm`, etc. Every block includes a typed payload, visibility, ordering, and version. Unknown block type must fail safely with monitoring, not crash the page.

## Publishing and cache
Public API only returns published records at published timestamps; drafts accessible only to authorized preview. Use ETag/Last-Modified or cache invalidation on publish. Revalidate public routes after CMS changes. Do not leak internal staff data, lead PII or admin-only fields.

## SEO pipeline
Backend may generate SEO draft metadata, keyword/tag suggestions, slug and internal-link suggestions, product-to-article draft conversion. Require review and publish workflow. Generate XML sitemap and structured data. Search Console sitemap submission/inspection may assist monitoring; Google Indexing API is not a general submission mechanism for product/blog pages. IndexNow only for supporting search engines. Never promise indexing or top rankings.

## Data model restrictions
No `any`, `unknown` used without narrowing, open-ended JSON blobs, arbitrary key dictionaries or `as` casting to bypass validation. API errors are typed and user-facing text localized through CMS/i18n.


## V3 verified paths from supplied backend OpenAPI design (verify in target repository)
- `GET /public/site` — global settings, navigation, branding, branches/contact references.
- `GET /public/pages/resolve` and `GET /public/pages/{slug}` — CMS pages and typed blocks.
- `GET /public/products`, `GET /public/products/{slug}`, `GET /public/product-filters` — catalog.
- `GET /public/branches`, `GET /public/branches/{slug}/contact-actions` — branch-specific Call/Zalo/email.
- `POST /public/lead-requests` — lead submission.
- `POST /admin/seo/suggest` — SEO suggestions, including social hashtags.
- `PATCH /admin/seo-metadata/{resourceType}/{resourceId}` — persist approved `keywords` and `socialHashtags`.
- `POST /admin/seo/article-drafts` — product-to-article draft creation (editorial approval required).
- `GET /admin/seo/jobs` — SEO job monitoring.

These are *design-time contract paths*, not a claim that a live backend is running. Validate request/response against the current OpenAPI. Never invent `POST /admin/seo/hashtags/preview` unless a new API-first change is approved.

## Next.js responsibilities
- Frontend displays generated suggestions and sends editor-approved `socialHashtags: string[]` and `keywords: string[]` to backend through authorized server-side admin integration.
- Backend owns normalized canonical tags, persistence, publication and indexing jobs. Next.js does not independently call Google APIs on every page view.
- Next.js must receive a verified publish webhook to invalidate relevant route caches; this webhook is an integration gap unless explicitly implemented in backend.
- Do not proxy NestJS admin credentials into browser JavaScript; use a BFF route only when authenticated/authorized, and keep tokens server-side.
- Published public data should be fetched server-side; cache policy depends on pinned Next.js version and actual publish behavior.

See `16_BACKEND_INTEGRATION_GAPS.md` for required additions to backend spec before coding.
