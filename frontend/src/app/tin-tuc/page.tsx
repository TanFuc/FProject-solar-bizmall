import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getArticles } from '@/lib/api/client';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { Calendar, Clock, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Tin Tức & Cẩm Nang Điện Mặt Trời — BM SOLAR',
  description:
    'Cập nhật chính sách giá điện mặt trời mái nhà 2026, hướng dẫn lựa chọn tấm pin, inverter hybrid và kinh nghiệm bảo trì hệ thống từ kỹ sư BM SOLAR.',
  canonicalPath: '/tin-tuc',
  ogImage: '/images/logo.png',
  keywords: [
    'tin tức điện mặt trời',
    'chính sách điện mặt trời 2026',
    'giá điện mặt trời áp mái',
    'kinh nghiệm lắp pin năng lượng mặt trời',
  ],
});

interface NewsPageProps {
  searchParams?: {
    category?: string;
  };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const currentCategory = searchParams?.category;
  const articlesResponse = await getArticles();

  let articles = articlesResponse.data;
  if (currentCategory) {
    if (currentCategory === 'chinh-sach') {
      articles = articles.filter((a) => a.category?.includes('Chính Sách'));
    } else if (currentCategory === 'ky-thuat') {
      articles = articles.filter((a) => a.category?.includes('Kỹ Thuật') || a.category?.includes('Giải Pháp'));
    } else if (currentCategory === 'cam-nang') {
      articles = articles.filter((a) => a.category?.includes('Cẩm Nang'));
    }
  }

  const categoryTabs = [
    { label: 'Tất cả bài viết', slug: '' },
    { label: 'Chính Sách Năng Lượng', slug: 'chinh-sach' },
    { label: 'Giải Pháp & Kỹ Thuật', slug: 'ky-thuat' },
    { label: 'Cẩm Nang Tư Vấn', slug: 'cam-nang' },
  ];

  const featuredArticle = articles[0];
  const listArticles = articles.slice(1);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Tin tức</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiến Thức & Chính Sách Năng Lượng</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Cẩm Nang & Tin Tức Điện Mặt Trời Mới Nhất
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Tổng hợp thông tư quy định, hướng dẫn kỹ thuật và phân tích bài toán tài chính điện mặt trời từ đội ngũ chuyên gia BM SOLAR.
          </p>
        </div>
      </section>

      {/* 2. Category Filter Tabs */}
      <section className="sticky top-20 z-30 bg-surface border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-ink-muted flex items-center gap-1.5 mr-2 hidden sm:flex">
              <Filter className="w-3.5 h-3.5" /> Chủ đề:
            </span>
            {categoryTabs.map((tab) => {
              const isActive =
                (!currentCategory && tab.slug === '') || currentCategory === tab.slug;

              return (
                <Link
                  key={tab.slug}
                  href={tab.slug ? `/tin-tuc?category=${tab.slug}` : '/tin-tuc'}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white text-ink-muted hover:text-ink hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <span className="text-xs text-ink-muted shrink-0 hidden md:block">
            Hiển thị <strong>{articles.length}</strong> bài viết
          </span>
        </div>
      </section>

      {/* 3. Featured Main Article */}
      {featuredArticle && !currentCategory && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-3xl border border-slate-200/80 overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
            <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-200">
              {featuredArticle.coverMediaUrl && (
                <Image
                  src={featuredArticle.coverMediaUrl}
                  alt={featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center"
                />
              )}
              {featuredArticle.category && (
                <span className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                  {featuredArticle.category}
                </span>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-orange" />
                  {featuredArticle.publishedAt
                    ? new Date(featuredArticle.publishedAt).toLocaleDateString('vi-VN')
                    : 'Mới cập nhật'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTimeMinutes || 5} phút đọc
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-snug hover:text-brand-primary transition-colors">
                <Link href={`/tin-tuc/${featuredArticle.slug}`}>
                  {featuredArticle.title}
                </Link>
              </h2>

              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3">
                {featuredArticle.excerpt}
              </p>

              <div className="pt-2">
                <Link
                  href={`/tin-tuc/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-brand-primary hover:text-brand-dark transition-colors group"
                >
                  <span>Đọc bài viết đầy đủ</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Articles Grid */}
      <section className="py-8 lg:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(currentCategory ? articles : listArticles).map((art) => (
            <Link
              key={art.id}
              href={`/tin-tuc/${art.slug}`}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {art.coverMediaUrl && (
                    <Image
                      src={art.coverMediaUrl}
                      alt={art.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {art.category && (
                    <span className="absolute top-3 left-3 bg-brand-primary/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {art.category}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {art.publishedAt
                    ? new Date(art.publishedAt).toLocaleDateString('vi-VN')
                    : 'Mới cập nhật'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTimeMinutes || 5} phút đọc
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Consultation Form */}
      <ConsultationFormBlock
        headline="Nhận Tư Vấn Kỹ Thuật Chuyên Sâu Từ Kỹ Sư BM SOLAR"
        subheading="Giải đáp mọi thắc mắc về chính sách điện lực EVN và phương án lắp đặt tối ưu cho công trình của bạn."
      />
    </div>
  );
}

