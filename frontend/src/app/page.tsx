import React from 'react';
import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { HeroCarousel } from '@/components/blocks/HeroCarousel';
import { CategoryStrip } from '@/components/blocks/CategoryStrip';
import { SolutionShowcase } from '@/components/blocks/SolutionShowcase';
import { FeatureHighlights } from '@/components/blocks/FeatureHighlights';
import { FeaturedProducts } from '@/components/blocks/FeaturedProducts';
import { ProjectShowcase } from '@/components/blocks/ProjectShowcase';
import { NewsSection } from '@/components/blocks/NewsSection';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import {
  fallbackCategories,
  fallbackAudiences,
  fallbackProducts,
  fallbackProjects,
  fallbackArticles,
} from '@/lib/api/mockData';

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
  const page = await getPageBySlug('home');

  // Find blocks or use rich structured fallback blocks
  const heroBlock = page.blocks.find((b) => b.type === 'heroCarousel');
  const catBlock = page.blocks.find((b) => b.type === 'categoryShowcase');
  const audBlock = page.blocks.find((b) => b.type === 'audienceShowcase');
  const featBlock = page.blocks.find((b) => b.type === 'featureHighlights');
  const prodBlock = page.blocks.find((b) => b.type === 'featuredProducts');
  const projBlock = page.blocks.find((b) => b.type === 'projectShowcase');
  const newsBlock = page.blocks.find((b) => b.type === 'newsSection');
  const leadBlock = page.blocks.find((b) => b.type === 'leadForm');

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Cinematic Section */}
      <HeroCarousel
        slides={
          (heroBlock?.data as { slides?: any[] })?.slides || [
            {
              title: 'GIẢI PHÁP ĐIỆN MẶT TRỜI & LƯU TRỮ NĂNG LƯỢNG CAO CẤP',
              accentPhrase: 'TIẾT KIỆM ĐẾN 90% CHI PHÍ ĐIỆN',
              subtitle:
                'Tổng thầu EPC uy tín hàng đầu miền Trung và Nam Bộ. Cam kết thiết bị Tier 1 chính hãng, bảo hành hiệu suất 25 năm, kỹ sư khảo sát 3D tận nơi miễn phí.',
              desktopMediaUrl:
                'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1920&q=85',
              mobileMediaUrl:
                'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=85',
              primaryCtaText: 'Khảo Sát & Báo Giá Miễn Phí',
              secondaryCtaText: 'Xem Giải Pháp Toàn Diện',
            },
          ]
        }
      />

      {/* 2. Curved Equipment Category Strip (5 categories) */}
      <CategoryStrip
        categories={
          (catBlock?.data as { categories?: any[] })?.categories || fallbackCategories
        }
      />

      {/* 3. Solutions by Audience (Hộ gia đình / Doanh nghiệp / Nhà xưởng) */}
      <SolutionShowcase
        audiences={
          (audBlock?.data as { audiences?: any[] })?.audiences || fallbackAudiences
        }
      />

      {/* 4. Golden Pillars / Feature Highlights */}
      <FeatureHighlights
        items={(featBlock?.data as { items?: any[] })?.items}
      />

      {/* 5. Featured Products Grid */}
      <FeaturedProducts
        products={
          (prodBlock?.data as { products?: any[] })?.products || fallbackProducts
        }
      />

      {/* 6. Completed Drone Projects Showcase */}
      <ProjectShowcase
        projects={
          (projBlock?.data as { projects?: any[] })?.projects || fallbackProjects
        }
      />

      {/* 7. Process 5 Steps on Royal Blue Background */}
      <ProcessFiveSteps
        tag="02 / NĂNG LỰC TRIỂN KHAI"
        title="Mỗi dự án — Một giải pháp phù hợp"
        rightLinkText="Xem quy trình chi tiết →"
        rightLinkHref="/giai-phap"
      />

      {/* 8. Energy News & Market Guide */}
      <NewsSection
        articles={
          (newsBlock?.data as { articles?: any[] })?.articles || fallbackArticles
        }
      />

      {/* 9. Bottom Journey CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />

      {/* 10. High-conversion Consultation Form Block */}
      <ConsultationFormBlock
        headline={(leadBlock?.data as { headline?: string })?.headline}
        subheading={(leadBlock?.data as { subheading?: string })?.subheading}
      />
    </div>
  );
}
