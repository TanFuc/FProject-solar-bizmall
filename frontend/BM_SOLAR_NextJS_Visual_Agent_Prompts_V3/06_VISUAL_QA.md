# Visual regression QA prompt

You are a visual QA engineer. Compare each implementation with its own latest full-page reference pair in `15_REFERENCE_MAP_AND_VISUAL_PRECEDENCE.md`; legacy collages are secondary. Do not merely judge aesthetics. Produce repeatable screenshots using Playwright (or existing project tooling) at 1440x900, 390x844, 360x800, 768x1024. Use consistent browser, device scale factor, fonts, content fixtures, image assets and scroll position.

## Method
1. Establish reference regions and target geometry. The collage is illustrative and may not be pixel-comparable as a whole; crop/normalize the specific design panel and document crop coordinates.
2. Capture implemented page at equivalent viewport; compare side by side and optionally compute SSIM or perceptual diff on aligned regions.
3. Evaluate hierarchy: hero/image coverage, nav height, headline wrapping, CTA placement, cards, curvature, crop/focal point, spacing, shadows, mobile safe area.
4. Fix critical mismatches first: wrong layout, wrong hero asset, wrong viewport, broken responsive, missing contact actions; then typography and microspacing.
5. Repeat until differences are within agreed tolerance or blocked by missing assets/reference ambiguity. Record exceptions; do not report 100% match without evidence.

## QA output
For each route/viewport: reference crop, actual screenshot, diff image, mismatch severity, change applied, status, and remaining unknowns. Also run keyboard, accessibility and functional checks. If reference image contains fictional or misspelled copy, use real CMS text while preserving typographic density.


## V3 full-page visual regression protocol
- For six pages, reference desktop is 1440px wide and mobile is 390px wide; use matching viewport widths and **full-page** Playwright captures. Home reference desktop/mobile use different pixel widths and are visual designs, not calibrated browser screenshots: align/crop with documented scale, not false 1:1 pixel metrics.
- Lock CMS fixtures, fonts, image assets, viewport, DPR, animation, browser and network conditions. Disable transitions during screenshot; wait for images/fonts to settle. Capture top/middle/bottom and entire page.
- Compare header, hero, category tiles, solution cards, product/project/news cards, contact form, partner band, footer, sticky mobile nav and floating actions.
- Generate `visual-qa/<route>/<viewport>/{reference,actual,diff}.png`, summary JSON and `visual-qa/report.md` with pixel/structural deviations and unresolved media mismatch.
- If source design has synthetic text or a mismatched aspect ratio, label region as approximation and still test DOM geometry and interactions. Never claim exact pixel match from AI mockups.
- Regression snapshots for each breakpoint must pass after layout changes; run axe and keyboard checks in addition to visual diff.
