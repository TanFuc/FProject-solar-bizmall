# Component Architecture Map

```text
src/
├── app/
│   ├── layout.tsx                   # Global Shell Layout (Topbar, Header, Footer, MobileBottomNav, Modal)
│   ├── loading.tsx                  # Lightweight route loading skeleton with solar mark
│   ├── not-found.tsx                # 404 Brand Page
│   ├── error.tsx                    # Error boundary
│   ├── page.tsx                     # Trang chủ (Homepage)
│   ├── gioi-thieu/page.tsx          # Giới thiệu
│   ├── giai-phap/page.tsx           # Giải pháp
│   ├── giai-phap/[slug]/page.tsx    # Chi tiết giải pháp
│   ├── san-pham/page.tsx            # Danh mục thiết bị
│   ├── san-pham/[slug]/page.tsx     # Chi tiết sản phẩm
│   ├── du-an/page.tsx               # Thư viện dự án
│   ├── du-an/[slug]/page.tsx        # Chi tiết dự án
│   ├── tin-tuc/page.tsx             # Tin tức & Cẩm nang
│   ├── tin-tuc/[slug]/page.tsx      # Chi tiết bài viết
│   ├── lien-he/page.tsx             # Liên hệ & Mạng lưới chi nhánh
│   ├── sitemap.ts                   # Dynamic XML sitemap
│   └── robots.ts                    # Dynamic robots policy
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx               # Utility topbar with branch selector & hotlines
│   │   ├── Header.tsx               # Main navigation header with logo & CTA
│   │   ├── Footer.tsx               # Multi-column branded footer
│   │   ├── MobileBottomNav.tsx      # Persistent 5-action bottom bar for Mobile
│   │   ├── MobileDrawer.tsx         # Slide-out navigation menu for Mobile
│   │   └── ConsultationModal.tsx    # Lead consultation form popup
│   ├── blocks/
│   │   ├── HeroCarousel.tsx         # Cinematic hero slider with text overlay
│   │   ├── CategoryStrip.tsx        # Curved 4-category equipment cards
│   │   ├── SolutionShowcase.tsx     # 3-audience solutions (Gia đình / Doanh nghiệp / Nhà xưởng)
│   │   ├── FeatureHighlights.tsx    # 4 golden commitment pillars
│   │   ├── FeaturedProducts.tsx     # Tier 1 product cards grid
│   │   ├── ProjectShowcase.tsx      # Drone-shot real projects grid
│   │   ├── NewsSection.tsx          # Latest articles & solar guides
│   │   └── ConsultationFormBlock.tsx# Inline lead request block
│   └── ui/
│       ├── Button.tsx               # Accessible button with primary/orange/outline variants
│       ├── Badge.tsx                # Tier 1, Warranty, Capacity badges
│       └── LoadingMark.tsx          # Animated SVG solar pulse loader
├── lib/
│   ├── api/
│   │   ├── client.ts                # Typed fetch wrapper with error envelope handling
│   │   └── mockData.ts              # High-fidelity CMS fallback data
│   ├── contacts/
│   │   └── branchContext.tsx        # Client React context for selected branch
│   └── seo/
│       └── metadata.ts              # SEO metadata & JSON-LD generators
└── types/
    └── bmsolar-api.ts               # Complete TypeScript definitions
```

