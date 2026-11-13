# AGENTS.md — mandatory rules for every coding agent

## Priority
1. Security, factuality, real backend contract, accessibility and legal requirements.
2. Latest page-specific reference image for visual layout.
3. This pack's Next.js architecture, API, SEO, loading and test requirements.
4. Legacy visual storyboard only where latest image has no answer.

## Do not
- Do not use Vite/CRA/Pages Router as the default. New project MUST use Next.js App Router.
- Do not paste the reference screenshot as a web page, fake video, or absolute-position an entire image.
- Do not hardcode business copy, logos, numbers, branches, contacts, products, news, SEO text, navigation or hero slides. Structural UI fallbacks are allowed.
- Do not use `any`, `Record<string, any>`, `as any`, `@ts-ignore`, blanket `eslint-disable`, broad unvalidated casts, unsafe raw HTML, or guessed API response types.
- Do not put Google credentials, NestJS admin tokens or SEO indexing keys into `NEXT_PUBLIC_*` variables.
- Do not promise rankings or claim a URL was indexed just because a sitemap was updated.
- Do not automatically publish unreviewed AI-generated SEO articles or misleading structured data.
- Do not trigger Google Indexing API for product/blog/project/solution pages; not eligible.
- Do not implement a global spinner that blocks LCP or causes navigation flashes.
- Do not bypass screenshot comparison. Do not claim tests passed without evidence.

## Must
- Use Next.js `app/` routes, Server Components by default, Client Components only for interactive UI.
- Check actual backend OpenAPI before coding API client; generate strict types and validate at trust boundaries.
- Use server-only data access for CMS public data and authenticated admin operations; keep frontend/backend separated.
- Use published-only data on public routes, `notFound()` for unpublished/missing content, noindex for preview.
- Implement 6 full-page reference pairs plus latest home desktop/mobile, with responsive bottom nav Call/Zalo.
- Use SEO event and cache revalidation strategies documented in this pack.
- Write and run unit, integration, Playwright, accessibility, SEO and visual regression tests.
- Keep an uncertainty log and report missing source assets, contacts and backend contract gaps.
