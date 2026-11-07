import { pageCopy } from '@/lib/api/visuals';
import { BrandStrip } from '@/components/blocks/BrandStrip';
import React from 'react';
import { Metadata } from 'next';
import { getBrands, getPageBySlug, getProductCategories, getAudiences, getProducts, getProjects, getArticles } from '@/lib/api/client';
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
  const page = await getPageBySlug('home');
  return constructMetadata({
    title: page.seo.metaTitle || 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
    description:
      page.seo.metaDescription ||
      'BM SOLAR cung cấp giải pháp điện mặt trời mái nhà hòa lưới & lưu trữ pin BESS cho hộ gia đình, doanh nghiệp, nhà xưởng tại Quy Nhơn, TP.HCM.',
    canonicalPath: '/',
    ogImage: page.seo.ogImageUrl || '/images/logo.png',
    keywords: page.seo.keywords,
  });
}

export default async function HomePage() {
  const [page, categories, audienceRows, products, projects, articles, brands] = await Promise.all([getPageBySlug('home'),getProductCategories(),getAudiences(),getProducts({pageSize:5}),getProjects({pageSize:4}),getArticles({pageSize:3}),getBrands()]);

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
      <CategoryStrip categories={items(catBlock?.data.categories, category) || categoryRows} />
      <SolutionShowcase audiences={audiences} title={copy.solutions} />
      <FeaturedProducts title={copy.products} products={items(prodBlock?.data.products, product) || products.data} />
      <ProjectShowcase title={copy.projects} projects={items(projBlock?.data.projects, project) || projects.data} />
      <FeatureHighlights items={highlights} headline={copy.features} />
      <NewsSection title={copy.news} articles={items(newsBlock?.data.articles, article) || articles.data} />
      <BrandStrip brands={brands} headline={typeof page.blocks.find(b=>b.type==='socialGrid')?.data.headline==='string' ? String(page.blocks.find(b=>b.type==='socialGrid')?.data.headline) : undefined} />
      <ConsultationFormBlock
        mediaUrl={slides[0]?.desktopMediaUrl}
        benefits={highlights.map(item=>item.label).filter((title):title is string=>Boolean(title))}
        headline={copy.consultation || (typeof leadBlock?.data.headline === 'string' ? leadBlock.data.headline : undefined)}
        subheading={copy.consultationSubtitle || (typeof leadBlock?.data.subheading === 'string' ? leadBlock.data.subheading : undefined)}
      />
    </div>
  );
}
