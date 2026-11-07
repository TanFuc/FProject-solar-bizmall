import { CmsJourney } from '@/components/blocks/CmsSections';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { getProducts, getAudiences, getProductCategories } from '@/lib/api/client';
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
  const [visuals, listing, allCategories, audiences] = await Promise.all([
    getPageVisuals('products'),
    getProducts({
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
  ]);

  const copy = visuals.copy;
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
          <CategoryStrip categories={categories} />
        </div>

        <div className="solar-catalog-layout">
          {/* Sidebar filters with client transitions and scroll preservation */}
          <aside className="solar-catalog-sidebar" aria-label="Bộ lọc sản phẩm">
            <h3>Danh mục</h3>
            <Link
              href={href('category')}
              scroll={false}
              aria-current={!resolvedSearchParams.category ? 'page' : undefined}
              className="transition-colors"
            >
              Tất cả
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

            <h3 className="mt-7">Ứng dụng</h3>
            <Link
              href={href('audience')}
              scroll={false}
              aria-current={!resolvedSearchParams.audience ? 'page' : undefined}
              className="transition-colors"
            >
              Tất cả
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

            {hasActiveFilters && (
              <div className="mt-8 pt-4 border-t border-slate-200">
                <Link
                  href="/san-pham"
                  scroll={false}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-orange font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa tất cả bộ lọc
                </Link>
              </div>
            )}
          </aside>

          {/* Catalog listing area */}
          <div>
            <div className="solar-catalog-toolbar">
              <div className="flex items-center gap-3">
                <p>
                  <strong>{copy.listTitle}</strong>
                  <span>{listing.meta.total} sản phẩm</span>
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
                  label="Sắp xếp"
                  options={[
                    { value: '', label: 'Mới nhất' },
                    { value: 'name_asc', label: 'Tên A–Z' },
                    { value: 'name_desc', label: 'Tên Z–A' },
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
                  Chưa có sản phẩm phù hợp với bộ lọc đã chọn.
                </p>
                <p className="text-xs text-ink-muted mb-4 max-w-sm">
                  Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục sản phẩm.
                </p>
                <Link
                  href="/san-pham"
                  scroll={false}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xem tất cả sản phẩm
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
    </div>
  );
}
