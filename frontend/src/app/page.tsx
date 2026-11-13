import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { CmsLongContent } from '@/components/blocks/CmsLongContent';
import { getLocalizedPage, labelsForLocale, pageHasPublishedEnglish } from '@/lib/api/localized-page';
import { pageCopy } from '@/lib/api/visuals';
import { BrandStrip } from '@/components/blocks/BrandStrip';
import React from 'react';
import { Metadata } from 'next';
import { getBrands, getProductCategories, getAudiences, getProducts, getProjects, getArticles } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { HeroCarousel } from '@/components/blocks/HeroCarousel';
import { CategoryStrip } from '@/components/blocks/CategoryStrip';
import { SolutionShowcase } from '@/components/blocks/SolutionShowcase';
import { FeatureHighlights } from '@/components/blocks/FeatureHighlights';
import { FeaturedProducts } from '@/components/blocks/FeaturedProducts';
import { ProjectShowcase } from '@/components/blocks/ProjectShowcase';
import { NewsSection } from '@/components/blocks/NewsSection';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { items, category, audience, product, project, article, heroSlides, featureItems } from '@/lib/api/blocks';



export async function generateMetadata(): Promise<Metadata> {
  const page = await getLocalizedPage('home');
  return constructMetadata({
    title: page.seo?.metaTitle || 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
    description:
      page.seo?.metaDescription ||
      'BM SOLAR cung cấp giải pháp điện mặt trời mái nhà hòa lưới & lưu trữ pin BESS cho hộ gia đình, doanh nghiệp, nhà xưởng tại Quy Nhơn, TP.HCM.',
    canonicalPath: '/',
    contentLocale: page.locale,
    englishAvailable: page.hasEnglish ?? await pageHasPublishedEnglish('home'),
    ogImage: page.seo?.ogImageUrl || '/images/logo.png',
    keywords: page.seo?.keywords,
  });
}

async function allPublished<T>(fetchPage: (page: number) => Promise<{ data: T[]; meta: { totalPages: number } }>) {
  const results: T[] = [];
  for (let page = 1; ; page++) {
    const result = await fetchPage(page);
    results.push(...result.data);
    if (page >= result.meta.totalPages || !result.data.length) return results;
  }
}

function curatedFirst<T extends { id: string }>(curated: T[] | undefined, published: T[]) {
  const byId = new Map(published.map(item => [item.id, item]));
  return [...new Map([...(curated || []).flatMap(item => byId.has(item.id) ? [[item.id, byId.get(item.id)!] as const] : []), ...byId]).values()];
}

export default async function HomePage() {
  const page = await getLocalizedPage("home");
  const [categories, audienceRows, products, projects, articles, brands, translate] = await Promise.all([
    getProductCategories(), getAudiences(), allPublished(p => getProducts({ page: p, pageSize: 50, locale: page.locale })),
    allPublished(p => getProjects({ page: p, pageSize: 50, locale: page.locale })), allPublished(p => getArticles({ page: p, pageSize: 50, locale: page.locale })), getBrands(), labelsForLocale(page.locale),
  ]);

  // Find blocks or use rich structured fallback blocks
  const heroBlock = page.blocks.find((b) => b.type === 'heroCarousel');
  const catBlock = page.blocks.find((b) => b.type === 'categoryShowcase');
  const audBlock = page.blocks.find((b) => b.type === 'audienceShowcase');
  const prodBlock = page.blocks.find((b) => b.type === 'featuredProducts');
  const projBlock = page.blocks.find((b) => b.type === 'projectShowcase');
  const newsBlock = page.blocks.find((b) => b.type === 'newsSection');
  const leadBlock = page.blocks.find((b) => b.type === 'leadForm');

  const copy = pageCopy(page.blocks);
  const highlights = featureItems(page.blocks.find(b=>b.type==='featureHighlights')?.data.items);
  const categoryIds = Array.isArray(catBlock?.data.categoryIds) ? catBlock.data.categoryIds.filter((id): id is string => typeof id === 'string') : [];
  const categoryRows = categoryIds.length ? categoryIds.flatMap(id => categories.filter(c => c.id === id)) : categories;
  const audiences = items(audBlock?.data.audiences, audience) || audienceRows;
  const slides = heroSlides(heroBlock?.data.slides);
  return (
    <div className="solar-home">
      <HeroCarousel slides={slides} />
      <CmsLongContent blocks={page.blocks} />
      <CategoryStrip english={page.locale === "en-US"} categories={(items(catBlock?.data.categories, category) || categoryRows).map(item => ({ ...item, name: translate(item.name) }))} />
      <SolutionShowcase audiences={audiences.map(item => ({ ...item, label: translate(item.label), description: item.description && translate(item.description) }))} title={copy.solutions} />
      <FeaturedProducts title={copy.products} products={curatedFirst(items(prodBlock?.data.products, product), products)} />
      <ProjectShowcase title={copy.projects} eyebrow={copy.projectsEyebrow} description={copy.projectsDescription} linkLabel={copy.projectsLink} projects={(curatedFirst(items(projBlock?.data.projects, project), projects)).map(item => ({ ...item,
        projectType: item.projectType && { ...item.projectType, name: translate(item.projectType.name) },
        province: item.province && { ...item.province, name: translate(item.province.name) },
      }))} />
      <FeatureHighlights items={highlights} headline={copy.features} />
      <NewsSection title={copy.news} eyebrow={copy.newsEyebrow} description={copy.newsDescription} linkLabel={copy.newsLink} articles={curatedFirst(items(newsBlock?.data.articles, article), articles)} />
      <BrandStrip english={page.locale === "en-US"} brands={brands} headline={typeof page.blocks.find(b=>b.type==='socialGrid')?.data.headline==='string' ? String(page.blocks.find(b=>b.type==='socialGrid')?.data.headline) : undefined} />
      <ConsultationFormBlock
        mediaUrl={slides[0]?.desktopMediaUrl}
        benefits={highlights.map(item=>item.label).filter((title):title is string=>Boolean(title))}
        headline={copy.consultation || (typeof leadBlock?.data.headline === 'string' ? leadBlock.data.headline : undefined)}
        subheading={copy.consultationSubtitle || (typeof leadBlock?.data.subheading === 'string' ? leadBlock.data.subheading : undefined)}
      />
      <ContentSuggestions  />
    </div>
  );
}
