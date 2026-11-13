import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { labelsForLocale } from '@/lib/api/localized-page';
import { CmsJourney, CmsProcess } from '@/components/blocks/CmsSections';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { getArticles, getArticleTags } from '@/lib/api/client';
import { getPageVisuals } from '@/lib/api/visuals';
import { visualMetadata } from '@/lib/api/visual-metadata';
import { PageHero, SectionHeading } from '@/components/layout/PageHero';
import { VisualImage } from '@/components/ui/VisualImage';
import { Pagination } from '@/components/ui/Pagination';
import { NewsletterSignup } from '@/components/blocks/NewsletterSignup';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';

interface Props {
  searchParams?: Promise<{
    tag?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = (await searchParams) || {};
  const hasFilter = Boolean(resolved.tag || (resolved.page && Number(resolved.page) > 1));
  return visualMetadata('news', '/tin-tuc', { noIndex: hasFilter });
}

export default async function NewsPage({ searchParams }: Props) {
  const resolvedSearchParams = (await searchParams) || {};
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const visuals = await getPageVisuals('news');
  const [listing, tags, translate] = await Promise.all([
    getArticles({ locale: visuals.page.locale, page, pageSize: 9, tag: resolvedSearchParams.tag }),
    getArticleTags(),
    labelsForLocale(visuals.page.locale),
  ]);
  const copy = visuals.copy;
  const english = visuals.page.locale === "en-US";
  const [featured, ...side] = listing.data;
  const date = (value?: string) => (value ? new Date(value).toLocaleDateString(visuals.page.locale) : '');

  return (
    <div className="solar-page solar-page-tin-tuc">
      <PageHero visuals={visuals} />
      <section className="solar-container solar-page-section">
        <SectionHeading eyebrow={copy.sectionEyebrow} title={copy.sectionTitle} />
        <nav aria-label={english ? "News topics" : "Chủ đề tin tức"} className="solar-filter-tabs">
          <Link href="/tin-tuc" aria-current={!resolvedSearchParams.tag ? 'page' : undefined}>
            {english ? "All" : "Tất cả"}
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.value}
              href={`/tin-tuc?tag=${encodeURIComponent(tag.value)}`}
              aria-current={resolvedSearchParams.tag === tag.value ? 'page' : undefined}
            >
              {translate(tag.label)}
            </Link>
          ))}
        </nav>
        {featured ? (
          <div className="solar-news-featured">
            <Link className="solar-news-featured-main" href={`/tin-tuc/${featured.slug}`}>
              <div className="solar-news-photo">
                <VisualImage
                  src={featured.coverMediaUrl}
                  alt={featured.title}
                  fill
                  sizes="(max-width:767px) 100vw,60vw"
                  className="object-cover"
                />
              </div>
              <div className="solar-news-card-copy">
                <small>
                  <CalendarDays size={13} />
                  {date(featured.publishedAt)}
                </small>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <span>
                  {english ? "Read article" : "Xem bài viết"} <ArrowRight size={15} />
                </span>
              </div>
            </Link>
            <div className="solar-news-featured-side">
              {side.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/tin-tuc/${article.slug}`}>
                  <div className="solar-news-photo">
                    <VisualImage
                      src={article.coverMediaUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width:479px) 100vw, (max-width:767px) 42vw, 17vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <small>{date(article.publishedAt)}</small>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="solar-empty">{english ? "No articles have been published for this topic." : "Chưa có bài viết đã xuất bản cho chủ đề này."}</p>
        )}
      </section>
      {side.length > 3 && (
        <section className="solar-container solar-page-section">
          <SectionHeading eyebrow={copy.latestEyebrow} title={copy.latestTitle} />
          <div className="solar-news-list">
            {side.slice(3).map((article) => (
              <Link key={article.id} href={`/tin-tuc/${article.slug}`}>
                <div className="solar-news-photo">
                  <VisualImage
                    src={article.coverMediaUrl}
                    alt={article.title}
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
                <div className="solar-news-card-copy">
                  <small>{date(article.publishedAt)}</small>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Pagination
        path="/tin-tuc"
        page={page}
        totalPages={listing.meta.totalPages}
        params={resolvedSearchParams}
      />
      <NewsletterSignup
        title={copy.newsletterTitle}
        subtitle={copy.newsletterSubtitle}
        consent={copy.newsletterConsent}
        message={copy.newsletterMessage}
      />
      <CmsJourney copy={copy} mediaUrl={visuals.media.factory} />
      <ContentSuggestions kind="news" />
    </div>
  );
}
