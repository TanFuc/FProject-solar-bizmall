import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Tin Tức & Cẩm Nang Chuyển Dịch Năng Lượng | BM SOLAR',
  description:
    'Cập nhật chính sách mua bán điện trực tiếp DPPA, cẩm nang kỹ thuật điện mặt trời áp mái và xu hướng công nghệ pin lưu trữ BESS tại Việt Nam.',
  canonicalPath: '/tin-tuc',
  ogImage: '/images/designs/hero-tin-tuc.png',
  keywords: [
    'tin tức điện mặt trời',
    'cơ chế DPPA',
    'giá điện mặt trời 2026',
    'cẩm nang lắp điện mặt trời',
    'chính sách năng lượng tái tạo',
  ],
});

interface NewsPageProps {
  searchParams?: {
    category?: string;
  };
}

export default function NewsPage({ searchParams }: NewsPageProps) {
  const currentCategory = searchParams?.category || 'all';

  const categoryTabs = [
    { label: 'Tất cả', slug: 'all' },
    { label: 'Chính sách & Thị trường', slug: 'chinh-sach' },
    { label: 'Cẩm nang kỹ thuật', slug: 'cam-nang' },
    { label: 'Dự án thực tế', slug: 'du-an-thuc-te' },
  ];

  const featured = {
    id: 'f1',
    title: 'Cơ chế mua bán điện trực tiếp (DPPA): Cơ hội vàng cho doanh nghiệp sản xuất chuyển dịch xanh',
    category: 'Chính sách & Thị trường',
    excerpt: 'Nghị định mới về DPPA mở đường cho doanh nghiệp tiếp cận trực tiếp nguồn năng lượng sạch từ các nhà phát triển điện gió và điện mặt trời.',
    date: '15/10/2026',
    readTime: '6 phút đọc',
    imageUrl: '/images/designs/tin-tuc-featured.png',
    slug: 'co-che-mua-ban-dien-truc-tiep-dppa-doanh-nghiep-xanh',
  };

  const articles = [
    {
      id: 'a1',
      title: 'So sánh pin lưu trữ Lithium LiFePO4 và ắc quy chì: Lựa chọn nào tối ưu cho hệ thống điện mặt trời?',
      category: 'Cẩm nang kỹ thuật',
      date: '12/10/2026',
      readTime: '4 phút',
      imageUrl: '/images/designs/tin-tuc-1.png',
      slug: 'so-sanh-pin-luu-tru-lithium-va-ac-quy-chi-dien-mat-troi',
    },
    {
      id: 'a2',
      title: 'Quy trình thẩm định an toàn PCCC cho hệ thống điện mặt trời áp mái nhà xưởng tiêu chuẩn 2026',
      category: 'Kỹ thuật & Tiêu chuẩn',
      date: '08/10/2026',
      readTime: '5 phút',
      imageUrl: '/images/designs/tin-tuc-2.png',
      slug: 'quy-trinh-tham-dinh-an-toan-pccc-dien-mat-troi-nha-xuong',
    },
    {
      id: 'a3',
      title: 'Hạ tầng trạm sạc xe điện kết hợp điện mặt trời: Xu hướng tất yếu tại các khu đô thị và trạm dừng nghỉ',
      category: 'Xu hướng công nghệ',
      date: '02/10/2026',
      readTime: '5 phút',
      imageUrl: '/images/designs/tin-tuc-3.png',
      slug: 'ha-tang-tram-sac-xe-dien-ket-hop-dien-mat-troi',
    },
  ];

  return (
    <div className="solar-page solar-page-tin-tuc w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_tin-tuc_desktop.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-tin-tuc.png"
            alt="Tin tức & Cẩm nang BM SOLAR"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              TIN TỨC & KIẾN THỨC
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Cập nhật chuyển động <br />
              <span className="text-[#FF6B19]">Năng lượng xanh</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              Phân tích chính sách, cẩm nang kỹ thuật và các xu hướng công nghệ điện mặt trời mới nhất.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#bai-viet-moi"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Xem bài viết mới nhất</span>
                <span>→</span>
              </a>
              <Link
                href="/giai-phap"
                className="px-5 py-2.5 sm:py-3 rounded-full border border-white/40 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Xem giải pháp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="bg-[#F8FAFC] border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">Tin tức</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Tin nổi bật & Mới nhất */}
      <section id="bai-viet-moi" className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                01 / TIN TỨC TIÊU ĐIỂM
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Xu hướng & Cẩm nang năng lượng mới
              </h2>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => {
              const active = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.slug === 'all' ? '/tin-tuc' : `/tin-tuc?category=${tab.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    active
                      ? 'bg-[#FF6B19] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Featured Large Article Card */}
          <Link
            href={`/tin-tuc/${featured.slug}`}
            className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/9] lg:aspect-[750/420] border border-slate-100"
          >
            <Image
              src={featured.imageUrl}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 750px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="sr-only">{featured.title}</span>
          </Link>

          {/* 3 Articles Grid matching BM_SOLAR_tin-tuc_desktop.png */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-4">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/tin-tuc/${art.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-50 border border-slate-200/80 aspect-[408/320]"
              >
                <Image
                  src={art.imageUrl}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="sr-only">
                  {art.title} - {art.category}
                </span>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <button className="w-8 h-8 rounded-full bg-[#FF6B19] text-white text-xs font-bold shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* 4. Blue Process Section */}
      <ProcessFiveSteps
        tag="02 / QUY TRÌNH HỖ TRỢ"
        title="Đồng hành cùng khách hàng từ tư vấn đến vận hành"
        rightLinkText="Xem quy trình →"
        rightLinkHref="/giai-phap"
      />

      {/* 5. Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Đăng ký nhận bản tin →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
