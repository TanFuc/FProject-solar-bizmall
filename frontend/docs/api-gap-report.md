# API Gap & Reconciliation Report

## Backend API Coverage Matrix
| Feature | Backend Golang Route | Supported Parameters | Status |
|---|---|---|---|
| Site Shell & Branding | `GET /api/v1/public/site-shell` | None | Fully Implemented & Seeded |
| Branch Contact & Channels | `GET /api/v1/public/branches/:slug/contact-actions` | `slug` ("quy-nhon", "go-vap-hcm") | Fully Implemented & Seeded |
| CMS Pages & Revisions | `GET /api/v1/public/pages/:pageKey` | `pageKey` ("home", "about", "solutions", etc.) | Fully Implemented with ETag & 304 |
| Product Catalog & Filters | `GET /api/v1/public/products` | `page`, `pageSize`, `category`, `brand`, `audience`, `sort` | Fully Implemented & Paginated |
| Product Detail | `GET /api/v1/public/products/:slug` | `slug` | Fully Implemented |
| Project Listing & Filters | `GET /api/v1/public/projects` | `page`, `pageSize`, `type`, `province` | Fully Implemented & Paginated |
| Project Detail | `GET /api/v1/public/projects/:slug` | `slug` | Fully Implemented |
| News Articles | `GET /api/v1/public/articles` | `page`, `pageSize`, `tag` | Fully Implemented & Paginated |
| Article Detail | `GET /api/v1/public/articles/:slug` | `slug` | Fully Implemented |
| Lead CRM Creation | `POST /api/v1/public/leads` | Headers: `Idempotency-Key`, Body: JSON with Honeypot | Fully Implemented with Spam Check |
| Dynamic Sitemap Feed | `GET /api/v1/public/sitemap.xml` | None | Fully Implemented |
| SEO 301 Redirect Resolver | `GET /api/v1/public/redirects` | None | Fully Implemented |

## Integration Verification
- Backend operates at `http://localhost:3001/api/v1`.
- Frontend utilizes Server Components to fetch from backend with tag revalidation.
- When backend is offline or during build time without local DB running, frontend seamlessly degrades to verified, typed fallback data (`mockData.ts`), ensuring zero build failures.

