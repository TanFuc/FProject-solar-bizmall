import { CmsJourney, CmsProcess } from '@/components/blocks/CmsSections';
import Link from 'next/link';
import { ArrowRight, MapPin, Search, RotateCcw } from 'lucide-react';
import { getProjects, getProjectTypes, getProvinces } from '@/lib/api/client';
import { getPageVisuals } from '@/lib/api/visuals';
import { visualMetadata } from '@/lib/api/visual-metadata';
import { PageHero, SectionHeading } from '@/components/layout/PageHero';
import { VisualImage } from '@/components/ui/VisualImage';
import { AutoSubmitSelect } from '@/components/ui/AutoSubmitSelect';
import { Pagination } from '@/components/ui/Pagination';
import { CatalogPendingIndicator } from '@/components/ui/CatalogPendingIndicator';

import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = (await searchParams) || {};
  const hasFilter = Boolean(
    resolved.type ||
    resolved.region ||
    resolved.q ||
    (resolved.page && Number(resolved.page) > 1)
  );
  return visualMetadata('projects', '/du-an', { noIndex: hasFilter });
}

interface Props {
  searchParams?: Promise<{
    type?: string;
    region?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) || {};
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const [visuals, listing, types, provinces] = await Promise.all([
    getPageVisuals('projects'),
    getProjects({
      page,
      pageSize: 9,
      type: resolvedSearchParams.type,
      province: resolvedSearchParams.region,
      search: resolvedSearchParams.q,
    }),
    getProjectTypes(),
    getProvinces(),
  ]);

  const copy = visuals.copy;

  const typeHref = (type?: string) => {
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (resolvedSearchParams.region) query.set('region', resolvedSearchParams.region);
    if (resolvedSearchParams.q) query.set('q', resolvedSearchParams.q);
    const qs = query.toString();
    return qs ? `/du-an?${qs}` : '/du-an';
  };

  const hasActiveFilters = Boolean(resolvedSearchParams.type || resolvedSearchParams.region || resolvedSearchParams.q);

  return (
    <div className="solar-page solar-page-du-an">
      <PageHero visuals={visuals} />

      <section className="solar-container solar-page-section">
        <SectionHeading
          eyebrow={copy.sectionEyebrow}
          title={copy.sectionTitle}
          link="/lien-he"
          label={copy.sectionLink}
        />

        {/* Filter Tabs with client transition & scroll=false */}
        <div className="solar-filter-tabs">
          <Link
            href={typeHref()}
            scroll={false}
            aria-current={!resolvedSearchParams.type ? 'page' : undefined}
            className="transition-colors"
          >
            Tất cả
          </Link>
          {types.map((type) => (
            <Link
              key={type.value}
              href={typeHref(type.value)}
              scroll={false}
              aria-current={resolvedSearchParams.type === type.value ? 'page' : undefined}
              className="transition-colors"
            >
              {type.label}
            </Link>
          ))}
        </div>

        {/* Filter form with AutoSubmitSelect */}
        <div className="space-y-4">
          <form action="/du-an" className="solar-project-filter">
            <AutoSubmitSelect
              name="type"
              value={resolvedSearchParams.type || ''}
              label="Loại dự án"
              options={[{ value: '', label: 'Loại dự án: Tất cả' }, ...types]}
            />
            <AutoSubmitSelect
              name="region"
              value={resolvedSearchParams.region || ''}
              label="Khu vực"
              options={[{ value: '', label: 'Khu vực: Tất cả' }, ...provinces]}
            />
            <div>
              <input
                type="search"
                name="q"
                defaultValue={resolvedSearchParams.q}
                placeholder="Tìm dự án theo tên…"
                aria-label="Tìm dự án theo tên"
              />
              <button aria-label="Tìm dự án" type="submit">
                <Search size={17} />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-between">
            <CatalogPendingIndicator />
            {hasActiveFilters && (
              <Link
                href="/du-an"
                scroll={false}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-orange font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xóa tất cả bộ lọc
              </Link>
            )}
          </div>
        </div>

        {copy.imageNote && <p className="solar-image-note">{copy.imageNote}</p>}

        {/* Project Tiles Gallery */}
        <div className="solar-project-gallery">
          {listing.data.map((project) => (
            <Link
              key={project.id}
              href={`/du-an/${project.slug}`}
              className="solar-project-tile group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <VisualImage
                src={project.coverMediaUrl}
                alt={project.title}
                fill
                sizes="(max-width:767px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <p>{project.projectType?.name}</p>
                <h3>{project.title}</h3>
                <span>
                  <MapPin size={13} />
                  {project.province?.name}
                </span>
              </div>
              <ArrowRight
                className="solar-round-arrow transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        {/* Recoverable Empty State */}
        {!listing.data.length && (
          <div className="solar-empty flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-surface border border-slate-200 text-center my-6" role="status">
            <p className="text-base font-semibold text-ink mb-1">
              Chưa có dự án phù hợp với bộ lọc đã chọn.
            </p>
            <p className="text-xs text-ink-muted mb-4 max-w-sm">
              Quý khách vui lòng thử tìm kiếm với điều kiện khác hoặc xóa bộ lọc để xem các dự án tiêu biểu khác của BM SOLAR.
            </p>
            <Link
              href="/du-an"
              scroll={false}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Xem tất cả dự án
            </Link>
          </div>
        )}

        <Pagination
          path="/du-an"
          page={page}
          totalPages={listing.meta.totalPages}
          params={resolvedSearchParams}
        />
      </section>

      <CmsProcess copy={copy} />
      <CmsJourney copy={copy} mediaUrl={visuals.media.factory} />
    </div>
  );
}
