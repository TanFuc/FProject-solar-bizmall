# BM SOLAR — Frontend Implementation Notes (P0 Discovery)

## 1. Project Overview & Scope
- **Framework:** Next.js 14 App Router, React 18, TypeScript Strict, Tailwind CSS.
- **Backend Architecture:** Golang API-First Monolith running at `http://localhost:3001/api/v1` (documented in `backend/docs/API_DOCUMENTATION.md`).
- **Data Policy:** 100% CMS-Driven & Zero-Hardcode. All business content, branches, categories, products, projects, articles, contact channels, and site shell configurations are resolved dynamically from Backend APIs with typed fallbacks.
- **Visual Truth:** Full-page design assets located in `frontend/BM_SOLAR_NextJS_Visual_Agent_Prompts_V3/BM_SOLAR_Full_Page_Designs/` and `references/`.

## 2. Rendering & Performance Strategy
- **Server Components by default:** Layout, static content blocks, SEO metadata, sitemaps, and initial HTML are rendered on the server for maximum crawlability and instant LCP.
- **Client Components only where needed:**
  - `Header` & `MobileDrawer`: Navigation menu toggle, search bar.
  - `BranchSelector`: Local branch context switching (Quy Nhơn / TP.HCM).
  - `MobileBottomNav`: 5-action fixed bar with direct branch-aware `tel:`, Zalo deep link, and consultation modal trigger.
  - `ConsultationModal`: Interactive lead submission form with client validation and idempotency key.
  - `ProductFilter`: Interactive category tabs and audience filters.
- **Loading Strategy:**
  - Route skeletons using Next.js `loading.tsx` and Suspense boundaries.
  - BM SOLAR brand solar pulse loading animation using inline CSS/SVG.
  - Never block initial above-the-fold HTML with an artificial full-screen spinner.

## 3. SEO & Indexing Compliance
- Open Graph, Twitter cards, and JSON-LD structured data (`Organization`, `LocalBusiness`, `Product`, `Article`, `BreadcrumbList`) rendered server-side.
- Canonical URLs and `sitemap.xml` generated dynamically from backend published entities.
- Google Indexing compliance: We do NOT misuse Google Indexing API for non-job/video pages. Standard dynamic XML sitemap and Search Console submission protocols are used.

