# 10 — Next.js App Router architecture

## Target
Next.js App Router (pin current supported stable version; verify cache API semantics for that version), React, TypeScript strict, Node LTS. NestJS modular monolith + MariaDB remains separate and authoritative for CMS, SEO metadata, lead management and jobs. Next.js is presentation/SSR/BFF, **not a second CMS**.

## Suggested structure
```text
src/
  app/
    layout.tsx                 # root html, font, shell, global styles
    loading.tsx                # lightweight route fallback, not splash overlay
    error.tsx                  # recoverable error UI
    not-found.tsx              # 404
    robots.ts                  # robots policy
    sitemap.ts                 # published canonical URL discovery
    (site)/
      page.tsx                 # home
      gioi-thieu/page.tsx
      giai-phap/page.tsx
      giai-phap/[slug]/page.tsx
      san-pham/page.tsx
      san-pham/[slug]/page.tsx
      du-an/page.tsx
      du-an/[slug]/page.tsx
      tin-tuc/page.tsx
      tin-tuc/[slug]/page.tsx
      lien-he/page.tsx
      chi-nhanh/[slug]/page.tsx
    api/
      cms/revalidate/route.ts # server-only signed webhook from NestJS
      leads/route.ts          # optional typed BFF proxy (if needed)
  components/
    layout/{TopBar,Header,Footer,MobileBottomNav,BranchPicker}.tsx
    ui/{ImageMedia,VideoMedia,Button,Icon,LoadingMark,Skeleton}.tsx
    blocks/                   # discriminated union CMS block renderers
    product/ project/ news/ solution/ lead/
  lib/
    api/{client,schemas,generated}.ts
    cms/{getPage,renderBlock,cache}.ts
    seo/{metadata,structuredData,canonical,routePolicy}.ts
    contacts/{normalizePhone,zaloLink}.ts
    env/server.ts
  styles/{tokens,global}.css
  tests/{unit,integration,e2e,visual}/
```

## Rendering policy
| Page/element | Default | Reason |
|---|---|---|
| Home, About, Solutions, Contact | Server-render + revalidate on publish | Fast initial HTML, editable CMS |
| Product/project/news listing | Server-render query/filter state; cache stable data | Crawlable listings, shareable URLs |
| Product/project/article detail | Server-render/ISR by canonical slug; on-demand revalidate | Indexable, up-to-date |
| Preview | Authenticated dynamic render + `noindex` | Draft confidentiality |
| Menus, sliders, filters, forms | Small Client Components | Interactivity only |
| Search results | Server-render when useful, usually `noindex` | Avoid index bloat |

Do not assume specific Next cache defaults: pin version, choose `cache`/`revalidate` options explicitly, and test publish invalidation. Cache keys must separate locale, branch when content differs, filter query and publication revision. Public data is safe to cache; private preview/lead data must never enter public caches.

## Type safety
- `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `useUnknownInCatchVariables`.
- No `any`, `as any`, `@ts-ignore`, broad `object`, or unvalidated JSON; use generated OpenAPI client types + runtime schema parse at network boundary.
- CMS blocks are discriminated unions (`type: 'hero' | 'productGrid' | ...`), with typed props and exhaustive rendering. Unknown CMS blocks fail safely and are logged without breaking page.
- Explicit typed `Result` or discriminated errors for API failures, not blanket catch that hides 404/401.

## Data and caching flow
`NestJS CMS publish` → durable outbox event → signed webhook to Next `/api/cms/revalidate` → validate signature/replay window/resource path → invalidate tags/path → update sitemap feed and redirects → monitor indexing. Do not expose webhook secret to browser. Webhook is a required integration extension if backend does not already implement it.

## API boundaries
- Browser may call published public endpoints where safe, but prefer Server Components for initial content. Admin SEO writes must be authenticated via backend or server-side BFF; never embed admin token in JS.
- Public lead submission may use a typed Next BFF for rate limiting/CSRF/origin checks and backend call; NestJS remains authoritative for validation and persistence.
- Use absolute canonical domain from server environment + CMS SEO path; never trust user-supplied `Host` headers.

## UI performance
Do not render huge Client Component trees. Lazy-load noncritical carousels, video players, maps, complex filters; keep above-fold hero lightweight. Use stable `sizes`, width/height/aspect-ratio and focal-point metadata to avoid CLS. Use one font family/weights where possible, preconnect only measured origins.
