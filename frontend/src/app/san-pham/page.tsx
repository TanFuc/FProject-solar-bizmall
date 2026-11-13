import { ProductSearchForm } from '@/components/ui/ProductSearchForm';
import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { labelsForLocale } from '@/lib/api/localized-page';
import { CmsJourney } from '@/components/blocks/CmsSections';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { getProducts, getAudiences, getProductCategories, getBrands } from '@/lib/api/client';
import { getPageVisuals } from '@/lib/api/visuals';
import { visualMetadata } from '@/lib/api/visual-metadata';
import { PageHero, SectionHeading } from '@/components/layout/PageHero';
import { CategoryStrip } from '@/components/blocks/CategoryStrip';
import { SolutionShowcase } from '@/components/blocks/SolutionShowcase';
import { VisualImage } from '@/components/ui/VisualImage';
import { AutoSubmitSelect } from '@/components/ui/AutoSubmitSelect';
import { Pagination } from '@/components/ui/Pagination';
import { CatalogPendingIndicator } from '@/components/ui/CatalogPendingIndicator';

import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = (await searchParams) || {};
  const hasFilter = Boolean(
    resolved.category ||
    resolved.audience ||
    resolved.brand ||
    resolved.sort ||
    resolved.q ||
    (resolved.page && Number(resolved.page) > 1)
  );
  return visualMetadata('products', '/san-pham', { noIndex: hasFilter });
}

interface Props {
  searchParams?: Promise<{
    category?: string;
    audience?: string;
    brand?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) || {};
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const visuals = await getPageVisuals('products');
  const [listing, categoryRows, audienceRows, brands, translate] = await Promise.all([
    getProducts({ locale: visuals.page.locale,
      page,
      pageSize: 9,
      category: resolvedSearchParams.category,
      audience: resolvedSearchParams.audience,
      brand: resolvedSearchParams.brand,
      sort: resolvedSearchParams.sort,
      search: resolvedSearchParams.q,
    }),
    getProductCategories(),
    getAudiences(),
    getBrands(),
    labelsForLocale(visuals.page.locale),
  ]);

  const allCategories = categoryRows.map(item => ({ ...item, name: translate(item.name) }));
  const audiences = audienceRows.map(item => ({ ...item, label: translate(item.label), description: item.description && translate(item.description) }));
  const copy = visuals.copy;
  const ui = (vi: string, en: string) => visuals.page.locale === "en-US" ? en : vi;

  const block = visuals.page.blocks.find((b) => b.type === 'categoryShowcase');
  const ids = Array.isArray(block?.data.categoryIds)
    ? block.data.categoryIds.filter((v): v is string => typeof v === 'string')
    : [];
  const categories = ids.length
    ? ids.flatMap((id) => allCategories.filter((c) => c.id === id))
    : allCategories;

  const href = (key: string, value?: string) => {
    const query = new URLSearchParams();
    for (const [name, text] of Object.entries(resolvedSearchParams)) {
      if (text && name !== 'page') query.set(name, text);
    }
    if (value) query.set(key, value);
    else query.delete(key);
    const qs = query.toString();
    return qs ? `/san-pham?${qs}` : '/san-pham';
  };

  const hasActiveFilters = Boolean(
    resolvedSearchParams.category || resolvedSearchParams.audience || resolvedSearchParams.brand || resolvedSearchParams.sort || resolvedSearchParams.q
  );

  return (
    <div className="solar-page solar-page-san-pham">
      {/* Page Hero remains stable during client filtering */}
      <PageHero visuals={visuals} />

      <section className="solar-container solar-page-section">
        <SectionHeading
          eyebrow={copy.sectionEyebrow}
          title={copy.sectionTitle}
          link="/lien-he"
          label={copy.sectionLink}
        />

        <div className="solar-catalog-categories">
          <CategoryStrip categories={categories} english={visuals.page.locale === "en-US"} selected={resolvedSearchParams.category} />
        </div>

        <div className="solar-catalog-layout">
          {/* Sidebar filters with client transitions and scroll preservation */}
          <aside className="solar-catalog-sidebar" aria-label={ui("Bộ lọc sản phẩm", "Product filters")}>
            <h3>{ui("Danh mục", "Categories")}</h3>
            <Link
              href={href('category')}
              scroll={false}
              aria-current={!resolvedSearchParams.category ? 'page' : undefined}
              className="transition-colors"
            >
              {ui("Tất cả", "All")}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={href('category', category.slug)}
                scroll={false}
                aria-current={resolvedSearchParams.category === category.slug ? 'page' : undefined}
                className="transition-colors"
              >
                {category.name}
              </Link>
            ))}

            <h3 className="mt-7">{ui("Ứng dụng", "Applications")}</h3>
            <Link
              href={href('audience')}
              scroll={false}
              aria-current={!resolvedSearchParams.audience ? 'page' : undefined}
              className="transition-colors"
            >
              {ui("Tất cả", "All")}
            </Link>
            {audiences.map((audience) => (
              <Link
                key={audience.id}
                href={href('audience', audience.code)}
                scroll={false}
                aria-current={resolvedSearchParams.audience === audience.code ? 'page' : undefined}
                className="transition-colors"
              >
                {audience.label}
              </Link>
            ))}

            {brands && brands.length > 0 && (
              <>
                <h3 className="mt-7">{ui("Thương hiệu", "Brands")}</h3>
                <Link
                  href={href('brand')}
                  scroll={false}
                  aria-current={!resolvedSearchParams.brand ? 'page' : undefined}
                  className="transition-colors"
                >
                  {ui("Tất cả", "All")}
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={href('brand', brand.slug)}
                    scroll={false}
                    aria-current={resolvedSearchParams.brand === brand.slug ? 'page' : undefined}
                    className="transition-colors"
                  >
                    {brand.name}
                  </Link>
                ))}
              </>
            )}

            {hasActiveFilters && (
              <div className="mt-8 pt-4 border-t border-slate-200">
                <Link
                  href="/san-pham"
                  scroll={false}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-orange font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {ui("Xóa tất cả bộ lọc", "Clear all filters")}
                </Link>
              </div>
            )}
          </aside>

          {/* Catalog listing area */}
          <div>
            <div className="mb-4">
              <ProductSearchForm id="catalog-search-query" english={visuals.page.locale === "en-US"} query={resolvedSearchParams.q} />
            </div>
            <div className="solar-catalog-toolbar">
              <div className="flex items-center gap-3">
                <p>
                  <strong>{copy.listTitle}</strong>
                  <span>{listing.meta.total} {ui("sản phẩm", "products")}</span>
                </p>
                <CatalogPendingIndicator />
              </div>

              <form action="/san-pham" className="flex items-center gap-2">
                {Object.entries(resolvedSearchParams)
                  .filter(([name]) => name !== 'sort' && name !== 'page')
                  .map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))}
                <AutoSubmitSelect
                  name="sort"
                  value={resolvedSearchParams.sort || ''}
                  label={ui("Sắp xếp", "Sort by")}
                  options={[
                    { value: '', label: ui("Mới nhất", "Newest") },
                    { value: 'name_asc', label: ui("Tên A–Z", "Name A–Z") },
                    { value: 'name_desc', label: ui("Tên Z–A", "Name Z–A") },
                  ]}
                />
              </form>
            </div>

            {/* Products grid */}
            <div className="solar-listing-products">
              {listing.data.map((product) => (
                <Link
                  key={product.id}
                  href={`/san-pham/${product.slug}`}
                  className="solar-listing-product group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <div className="solar-listing-product-photo">
                    <VisualImage
                      src={product.coverMediaUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width:767px) 50vw, 24vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.summary}</p>
                    <span className="transition-transform group-hover:translate-x-1">
                      {copy.detailLink}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recoverable empty state */}
            {!listing.data.length && (
              <div className="solar-empty flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-surface border border-slate-200 text-center my-6" role="status">
                <p className="text-base font-semibold text-ink mb-1">
                  {ui("Chưa có sản phẩm phù hợp với bộ lọc đã chọn.", "No products match the selected filters.")}
                </p>
                <p className="text-xs text-ink-muted mb-4 max-w-sm">
                  {ui("Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục sản phẩm.", "Try another search or clear the filters to browse the full catalog.")}
                </p>
                <Link
                  href="/san-pham"
                  scroll={false}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {ui("Xem tất cả sản phẩm", "View all products")}
                </Link>
              </div>
            )}

            <Pagination
              path="/san-pham"
              page={page}
              totalPages={listing.meta.totalPages}
              params={resolvedSearchParams}
            />
          </div>
        </div>
      </section>

      <section className="solar-related-section">
        <div className="solar-container">
          <SectionHeading
            eyebrow={copy.relatedEyebrow}
            title={copy.relatedTitle}
            link="/giai-phap"
            label={copy.relatedLink}
          />
          <SolutionShowcase audiences={audiences} />
        </div>
      </section>

      <CmsJourney copy={copy} mediaUrl={visuals.media.factory} />
      <ContentSuggestions kind="products" />
    </div>
  );
}
