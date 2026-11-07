# 16 — Backend contract verification and integration gaps

## Verified design-time contract from earlier BM SOLAR backend docs
The bundled design-time snapshot `contracts/backend-openapi-reference.yaml` (copied from the separately delivered backend spec) specifies public site/pages/products/branches/lead endpoints and admin SEO endpoints. **This pack does not contain a running backend**; all integrations must be checked against the actual repository and deployed API. Do not assert missing endpoints already exist.

| Feature | Backend design-time endpoint / event | Status and action |
|---|---|---|
| Global site/menu | `GET /public/site` | Validate exact response fields |
| CMS pages | `GET /public/pages/resolve`, `GET /public/pages/{slug}` | Validate block schema and publication |
| Products | `GET /public/products`, `GET /public/products/{slug}` | Validate filters and canonical |
| Branch Call/Zalo | `GET /public/branches/{slug}/contact-actions` | Validate phone normalization and Zalo URL |
| Lead submission | `POST /public/lead-requests` | Validate consent, anti-spam and response |
| SEO suggestions | `POST /admin/seo/suggest` | Returns keywords/tags/social hashtags; verify auth and response |
| SEO approval | `PATCH /admin/seo-metadata/{resourceType}/{resourceId}` | Accepts `keywords`, `socialHashtags`; version/conflict check |
| Article drafts | `POST /admin/seo/article-drafts` | Editorial approval before publish |
| SEO job status | `GET /admin/seo/jobs` | Verify actual indexing job states |
| Published URL feed for Next sitemap | **Gap: endpoint/contract must be confirmed** | Add API-first if absent; do not guess paths |
| Signed CMS publish webhook | **Gap: event payload, HMAC, delivery semantics** | Add OpenAPI/event schema + outbox worker |
| Old-slug redirects feed | **Gap: confirm redirect contract** | Required for 301 on slug changes |
| Search Console index observations | **Gap: confirm monitoring API and authorization** | Server-only, quota-aware; not mandatory for MVP launch |
| Next frontend cache revalidation | `/api/cms/revalidate` on Next | Implement server-only; require backend event producer |

## Contract-first procedure
1. Read live backend `openapi.yaml` and `schemas/page-blocks.schema.json` if present.
2. Generate typed client; use runtime parsing. List schema discrepancies before implementation.
3. For missing behavior, write an API change proposal (`docs/api-changes/*.md`) with request/response, auth, errors, idempotency, events and acceptance tests.
4. Get approval/update backend contract before relying on the new endpoint. Use local typed fixtures in the meantime, explicitly marked MOCK.
5. Never call Google directly from browser; NestJS SEO worker handles Search Console/IndexNow.

## Example webhook proposal (not a confirmed existing endpoint)
```json
{
  "eventId": "7d28f4e0-40e4-4a9d-bc1a-b2e73d07a29f",
  "eventType": "content.published",
  "resourceType": "product",
  "resourceId": "f21a74b7-38fd-4b8d-a0ea-4e1e90886d14",
  "revision": 12,
  "locale": "vi-VN",
  "canonicalPath": "/san-pham/tam-pin-demo",
  "occurredAt": "2026-11-07T02:00:00+07:00"
}
```
Never expose actual customer PII or unpublished preview tokens in webhook logs.
