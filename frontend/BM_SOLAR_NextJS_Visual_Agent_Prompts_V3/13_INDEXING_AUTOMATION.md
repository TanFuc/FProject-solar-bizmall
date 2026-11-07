# 13 — Automated indexing discovery, Google Search Console and publish events

## Truth and constraints
**No API can guarantee Google indexes or ranks an ordinary product/blog/project URL.** Google's Indexing API is intended for pages with `JobPosting` or `BroadcastEvent` embedded in `VideoObject` (eligible use cases), **not** BM SOLAR product/news/project pages. Search Console's URL Inspection API reports observations; it does not force indexing. Google does not use IndexNow as its general URL submission protocol. Do not implement fake continuous submission or label queued URLs `indexed`.

## Event-driven, not spam-driven
`ContentPublished/Updated/Unpublished/Moved` in NestJS → transactional outbox → durable worker (retry/idempotency) → publish canonical URL feed/sitemap → authenticated Next cache invalidation → optional Search Console sitemap registration when necessary → optional IndexNow submission to participating search engines → periodic Search Console coverage observation.

### Required state model
- `draft`, `review`, `published`, `unpublished` — CMS publication states.
- `sitemap_eligible`, `sitemap_listed`, `sitemap_removed` — local sitemap states.
- `gsc_sitemap_submitted`, `gsc_inspection_requested`, `gsc_observed_indexed`, `gsc_observed_not_indexed`, `gsc_unknown` — distinguish requests/observations; timestamps and source recorded.
- `indexnow_queued`, `indexnow_accepted`, `indexnow_failed` — optional participating engine state; accepted != indexed.
- `revalidate_queued`, `revalidate_success`, `revalidate_failed` — Next.js cache state.

### Trigger rules
| Event | Sitemap | Cache | Search signals |
|---|---|---|---|
| Publish | Add canonical + real `lastmod` | Revalidate route/listing/home | Ensure sitemap discoverable; optional IndexNow |
| Substantive update | Update `lastmod` | Revalidate route and linked listings | Optional IndexNow; no Google API URL push |
| Unpublish | Remove canonical | Invalidate; route 404/410 as appropriate | Optional IndexNow update |
| Slug change | 301 old→new; add new canonical | Invalidate old/new | Sitemap update; optional IndexNow |
| Draft save | No public change | No public invalidation | No submission |

## Scheduler and reliability
- Immediate publish event, deduplicated by `(provider, canonicalUrl, revision, action)`.
- Daily sitemap integrity reconciliation; optional Search Console inspection at a **rate-limited, quota-aware cadence** (e.g. sample important new URLs after a reasonable delay; no tight polling loop). Weekly index coverage report.
- Retry exponential backoff+jitter (bounded attempts), dead-letter queue, alert on repeated failures, idempotent replays. Never leak private preview URLs or lead PII.
- Submit sitemap to Search Console only when necessary (first registration/significant configuration change), not every page view or on a fixed seconds-level loop.
- `lastmod` must reflect real meaningful content changes; no synthetic daily updates to pretend freshness.

## Search Console integration (backend-owned)
1. Verify Search Console property and service-account authorization. Store credentials server-side in NestJS secrets management; never `NEXT_PUBLIC_*`.
2. Submit sitemap URL through Search Console Sitemaps API when configured; monitor sitemap processing and URL Inspection results within quotas.
3. Persist observed status with `observedAt`, `source`, `canonicalUrl` and provider response; differentiate `indexed` vs `not indexed` vs `unknown`.
4. Dashboard reports index coverage and action recommendations; never auto-generate thin content to chase rankings.

## Next.js integration
- Implement server-only signed webhook `/api/cms/revalidate` with HMAC verification, timestamp/replay protection, allowlisted route patterns, revision dedupe and proper authorization. Backend must be updated with webhook event contract if absent.
- Use supported `revalidatePath`/`revalidateTag` for the **pinned** Next.js version. Test caching behavior; never assume revalidation means Google has recrawled.
- `app/sitemap.ts` reads published URL feed from backend. If no backend URL feed exists, define an API-first extension and do not fabricate published URL lists.

## Anti-patterns forbidden
- Calling Google Indexing API on ordinary product/blog URLs.
- Continuous per-second URL submission or retry without quotas/backoff.
- Fake `indexed: true` after submitting sitemap.
- Publishing AI drafts without human review.
- Using client browser to hold Search Console service credentials.

## References
- https://developers.google.com/search/apis/indexing-api/v3/using-api
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
