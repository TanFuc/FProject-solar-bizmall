# Design system — reference-driven, not invented

## Brand palette (starting tokens; verify against actual brand logo and screenshots)
- Primary BM Blue `#0D4EA6`; Deep Navy `#0D2E63`; CTA Orange `#FF6B19`; Ink `#12243D`; Surface `#F5F8FC`; White `#FFFFFF`.
- Orange CTA: ensure readable foreground and sufficient contrast; adjust orange to a darker accessible variant where necessary.
- Design is bright, editorial, premium clean energy, with strong real-world architectural solar photography. Avoid generic startup dashboard aesthetics.

## Typography
Use a legible Vietnamese-capable sans font; inspect image and available licensed fonts before selecting. Establish fluid heading scale and consistent body weights. Reference typography is an approximation, not a font license. Avoid arbitrary font substitutions per page.

## Layout
- Thin navy utility bar on desktop with branches, hotline, email, socials.
- White primary nav with logo left, links center, orange consultation CTA right.
- Homepage hero is image-led, edge-to-edge wide crop, deep blue left-side readability overlay, large white headline and orange emphasized phrase, two CTAs, understated slide dots/arrows.
- Soft curved transition into five equipment category tiles (if present in latest home image), then blue image-led solutions band.
- Product and project cards: high-quality image, concise text, restrained borders/shadows, consistent radius.
- Prefer visual content ratio > prose on first screen; no long paragraphs in hero.
- Maintain consistent spacing rhythm (4/8/12/16/24/32/48/64 px starting points). Measure screenshots and tune rather than blindly applying numbers.

## Tokens to create
`--color-brand`, `--color-navy`, `--color-accent`, `--color-ink`, `--color-surface`, `--radius-card`, `--shadow-card`, `--container-max`, `--header-height`, `--bottom-nav-height`, spacing and type scales. Never scatter magic colors throughout components.

## Imagery
Real content imagery from CMS, optimized WebP/AVIF with responsive srcsets. Use appropriate focal points/crop metadata. Do not reuse the reference collage as a banner. Do not present AI concept images as actual completed projects. Provide descriptive alt text.


## V3 design authority and token implementation
- Latest full-page assets, not this approximate palette, determine actual pixel geometry. Measure section heights, hero image focal point, rounded card radius, typography and white space.
- In Next.js, define CSS custom properties centrally in `app/globals.css` or a design-tokens module. Share all layout/spacing tokens across routes; do not hardcode page-specific random values.
- Reference home mobile shows 5 equipment categories and bottom actions: Home, Call, Zalo, Consultation, Menu. Do not blindly reuse legacy four-tile spec.
- Use a Vietnamese-capable font via `next/font` with `display: swap` and stable fallback metrics. Match screenshot typography where licensing allows; document substitutions.
- `next/image` must receive genuine image assets, never the reference screenshot itself as a rendered site section. Store crop/focal-point in CMS media metadata; desktop/mobile art direction when available.
- If an AI reference contains unreadable or impossible text, use accurate CMS copy while preserving visual text density; record discrepancy.
