import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { RichDocument } from '@/components/ui/RichDocument';
import { getCurrentContentLocale } from '@/lib/api/localized-page';
import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  CheckCircle2,

  Sparkles,
} from 'lucide-react';

interface ArticleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.data.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const article = await getArticleBySlug(slug, locale);
  if (!article) {
    return constructMetadata({ title: 'Không Tìm Thấy Bài Viết', noIndex: true, canonicalPath: `/tin-tuc/${slug}` });
  }

  return constructMetadata({
    title: `${article.title} | BM SOLAR`,
    description: article.excerpt,
    canonicalPath: `/tin-tuc/${article.slug}`,
    contentLocale: locale,
    englishAvailable: article.hasEnglish,
    ogImage: article.coverMediaUrl,
    keywords: [
      article.title,
      article.category || 'Điện mặt trời',
      'kiến thức năng lượng mặt trời',
      'BM Solar tin tức',
    ],
  });
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  const english = locale === "en-US" && article.hasEnglish;
  const articleSchema = getArticleSchema(article);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: english ? "Home" : "Trang chủ", url: '/' },
    { name: english ? "News" : "Tin tức", url: '/tin-tuc' },
    { name: article.title, url: `/tin-tuc/${article.slug}` },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      {/* 1. Breadcrumb */}
      <div className="bg-surface border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              {english ? "Home" : "Trang chủ"}
            </Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-brand-primary transition-colors">
              {english ? "News" : "Tin tức"}
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Article Header */}
      <article className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-4">
          {article.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-bold">
              {article.category}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-2 border-y border-slate-100 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <User className="w-4 h-4 text-brand-primary" />
              {english ? "BM SOLAR Editorial Team" : "Ban Biên Tập BM SOLAR"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-orange" />
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString(english ? 'en-US' : 'vi-VN')
                : english ? 'Recently updated' : 'Mới cập nhật'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {article.readTimeMinutes || 5} {english ? "min read" : "phút đọc"}
            </span>
          </div>
        </header>

        {/* Lead Excerpt */}
        <p className="text-base sm:text-lg text-ink font-medium leading-relaxed italic border-l-4 border-accent-orange pl-4 bg-surface py-3 rounded-r-xl">
          {article.excerpt}
        </p>

        {/* Featured Cover Image */}
        <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 shadow-card">
          <Image
            src={article.coverMediaUrl || '/images/designs/tin-tuc-featured.png'}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover object-center"
          />
        </div>

        <RichDocument value={article.bodyJson} className="solar-document-column" />

        {/* Share & Return */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{english ? "Back to news" : "Quay lại danh mục tin tức"}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>{english ? "Share article" : "Chia sẻ bài viết"}</span>
          </div>
        </div>
      </article>

      {/* 3. Consultation Form */}
      <ConsultationFormBlock
        headline={english ? "Speak with a BM SOLAR engineer" : "Nhận Tư Vấn Kỹ Thuật Miễn Phí Từ Kỹ Sư BM SOLAR"}
        subheading={english ? "Contact us for a load analysis and a detailed estimate." : "Liên hệ ngay để được phân tích biểu đồ phụ tải và lập dự toán chi phí chi tiết."}
      />
      <ContentSuggestions kind="news" slug={slug} group={article.category} />
    </div>
  );
}

