# Responsive and interaction contract

## Breakpoints (implementation starting points)
Mobile 320–767; tablet 768–1023; desktop >=1024. Do not assume screenshot dimensions equal CSS pixels; compare at 360, 390, 768, 1024, 1440 and 1920 widths.

## Mobile shell
Compact top brand bar/logo with search and menu; content respects safe-area insets. Fixed bottom bar: **Trang chủ, Gọi ngay, Zalo, Tư vấn, Menu** in that order; ensure Call and Zalo are visible without scrolling. Minimum target 44x44 CSS px. Main content padded to avoid being obscured by fixed bar.

## Contact behavior
`tel:+84...` for calling; `https://zalo.me/<normalized-national-number>` or CMS-verified official deep link for Zalo. Resolve active branch first; when absent, use CMS default branch; when no valid number exists, disable action with informative accessible state. Never use demo phone numbers as real contact data. `mailto:` email actions from CMS.

## Desktop shell
Topbar with branch switcher and contact; header with navigation and orange CTA; optionally fixed support widget with Call/Zalo but do not obscure content. Dropdown keyboard support, active nav, sticky behavior only if screenshot/UX validates it.

## Motion
Hero slider pause on hover/focus, explicit controls and sensible intervals, respects prefers-reduced-motion. Lazy-load offscreen video, show poster, play/pause button with keyboard semantics, avoid autoplay with sound. On mobile prioritize LCP image before heavy video.

## Dynamic states
Loading skeleton, no results, network error/retry, lead form validation/success/failure, unpublished content 404, empty image gallery, missing video, missing phone, branch selection, filter reset, pagination and search.


## V3 Next.js responsive rules
- Preserve fixed nav in a stable client-side shell, but render initial state without layout shift; route active state uses pathname and accessible labels. Reserve `padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))` on mobile content.
- Branch selection persists in a non-sensitive cookie or client state and must hydrate without mismatched labels; CMS default branch is the SSR fallback.
- On mobile `tel:` must be a real anchor with validated E.164 phone; Zalo link must be CMS verified. No hardcoded 1900 number from design mockup.
- Use `next/link` for internal routes, real anchors for external actions, and accessible dialogs/drawers for menu and filters.
- Avoid layout shifts during route transitions; show scoped skeletons rather than global full-screen loading overlays.
- Screen widths to test: 320, 360, 390, 430, 768, 1024, 1440, 1920 CSS px. Respect keyboard, reduced motion and touch targets.
