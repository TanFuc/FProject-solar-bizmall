# 14 — Global loading, media optimization and performance

## UX objective
Recreate BM SOLAR's loading identity without delaying content or SEO. The supplied `BM_SOLAR_loading_icon.svg/.gif/.png` and desktop/mobile loading screens are **visual references**; they do not justify a full-screen blocking spinner on every route.

## Loading hierarchy
1. **Initial public HTML:** server-render useful above-fold content as early as possible. Avoid a splash that hides hero while fetching content.
2. **Route transition:** Next.js `loading.tsx` / Suspense boundary uses a skeleton that mirrors the target section's dimensions. Keep global shell visible, prevent CLS.
3. **Section/data fetch:** scoped skeleton or optimistic state; product cards, news cards and filter results use shaped placeholders.
4. **Lead form submission:** button-level pending spinner with accessible status, disabled duplicate submit, error/success message.
5. **Video/map/third-party:** poster/placeholder until user action or intersection; no heavyweight script blocking hero.
6. **Optional branded splash:** only if real app initialization requires it; never artificial delay, avoid on repeat navigation, provide text status and skip if reduced motion.
7. **Failure:** typed error boundary with retry and non-blocking shell, not infinite spinner.

## Loading icon implementation
- Prefer optimized inline SVG/CSS animation matching brand's solar mark, or supplied SVG if safe/optimized; no looping GIF when CSS/SVG is smaller and accessible.
- `role="status"` and localized `aria-label="Đang tải nội dung"`; mark purely decorative spinner `aria-hidden="true"`. Use a single live region to avoid screen-reader noise.
- Respect `prefers-reduced-motion`; animation optional. CSS transition durations short, avoid large continuous GPU work.
- The loading screen mockup should not be exported as one image covering the viewport; recreate logo/loader/background as responsive components.

## Global layout and shell
- `app/layout.tsx`: `html lang="vi"`, `next/font`, metadata defaults, server-side global CMS shell, header/footer, safe area and mobile bottom nav.
- Avoid async waterfall: fetch independent site shell and page content concurrently where possible; do not fetch the same site settings multiple times per request.
- Reserve media aspect ratios, skeleton dimensions and sticky nav height. No hydration mismatch due to branch persistence.
- Global error/not-found/maintenance/empty states share the design system and never expose stack traces.

## Images, video, fonts
- LCP hero: right source, art-directed crop, responsive sizes, priority/preload as supported, avoid lazy loading above fold, stable dimensions. Use `next/image`, optimized formats (AVIF/WebP where supported) and CMS image focal point.
- Below-fold images lazy, responsive and compressed; no unnecessarily huge 4K assets on 390px phones. Use lazy video poster and explicit controls, no autoplay with audio.
- Fonts: one Vietnamese-capable family with required weights via `next/font`, minimize variants, stable fallback metrics.
- Use bundle analyzer to find large client dependencies; dynamically import map/video/chart components; no unneeded UI frameworks.

## Cache and web vitals
- Pin Next.js version and document explicit caching; invalidation on CMS publication/slug change; avoid stale published/unpublished leaks.
- Target **p75** LCP <=2.5s, INP <=200ms, CLS <=0.1; test mobile throttling, image sizes and field data where available.
- Lab goals: Lighthouse Performance >=90 (target, not guarantee), SEO >=95, Accessibility >=95; report exact run config and actual results.
- Capture JS transferred, image bytes, LCP element, route TTFB, cache hit rate, 4xx/5xx, error counts; improve bottlenecks before visual micro-polish.

## Global SEO/performance test cases
- Slow 3G/mobile: text and hero usable, loading never infinite.
- Disable JS: primary published content still in server HTML.
- Rapid navigation: no stale branch contact link, no repeated splash, no duplicate lead submissions.
- Unpublish: route no longer renders indexable content after revalidation.
- Reduced motion and keyboard navigation remain functional.
