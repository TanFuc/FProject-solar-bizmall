import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Search, ChevronDown } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Dự Án Tiêu Biểu — Giá Trị Xanh Bền Vững | BM SOLAR',
  description:
    'Khám phá những mô hình ứng dụng điện mặt trời áp mái hộ gia đình, doanh nghiệp, nhà xưởng và trạm sạc xe điện do BM SOLAR triển khai trên toàn quốc.',
  canonicalPath: '/du-an',
  ogImage: '/images/designs/hero-du-an.png',
  keywords: [
    'dự án điện mặt trời',
    'điện mặt trời Quy Nhơn',
    'điện mặt trời áp mái nhà xưởng',
    'trạm sạc xe điện BM Solar',
    'hệ thống lưu trữ pin BESS',
  ],
});

interface ProjectsPageProps {
  searchParams?: {
    type?: string;
    region?: string;
    q?: string;
  };
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const currentType = searchParams?.type || 'all';

  const categoryTabs = [
    { label: 'Tất cả', slug: 'all' },
    { label: 'Hộ gia đình', slug: 'ho-gia-dinh' },
    { label: 'Doanh nghiệp', slug: 'doanh-nghiep' },
    { label: 'Nhà xưởng', slug: 'nha-xuong' },
    { label: 'Trạm sạc', slug: 'tram-sac' },
  ];

  const allProjects = [
    {
      id: 'p1',
      title: 'Hệ thống điện mặt trời áp mái',
      type: 'ho-gia-dinh',
      sub: 'Hộ gia đình • 15 kWp',
      province: 'Bình Định',
      slug: 'dien-mat-troi-ap-mai-biet-thu-quy-nhon',
      imageUrl: '/images/designs/du-an-1.png',
    },
    {
      id: 'p2',
      title: 'Điện mặt trời nhà xưởng',
      type: 'nha-xuong',
      sub: 'Khu công nghiệp • 250 kWp',
      province: 'Bình Định',
      slug: 'dien-mat-troi-nha-xuong-kcn-nhon-hoi',
      imageUrl: '/images/designs/du-an-2.png',
    },
    {
      id: 'p3',
      title: 'Giải pháp năng lượng doanh nghiệp',
      type: 'doanh-nghiep',
      sub: 'Thương mại • 50 kWp',
      province: 'TP.HCM',
      slug: 'dien-mat-troi-toa-nha-van-phong-go-vap',
      imageUrl: '/images/designs/du-an-3.png',
    },
    {
      id: 'p4',
      title: 'Hệ thống lưu trữ kết hợp PV',
      type: 'ho-gia-dinh',
      sub: 'Hybrid BESS • 20 kWh',
      province: 'TP.HCM',
      slug: 'he-thong-luu-tru-hybrid-bess-biet-thu',
      imageUrl: '/images/designs/du-an-4.png',
    },
    {
      id: 'p5',
      title: 'Trạm sạc kết hợp điện mặt trời',
      type: 'tram-sac',
      sub: 'Hạ tầng EV • 60 kW',
      province: 'Bình Định',
      slug: 'tram-sac-xe-dien-nang-luong-mat-troi-ev',
      imageUrl: '/images/designs/du-an-5.png',
    },
    {
      id: 'p6',
      title: 'Điện mặt trời áp mái công nghiệp',
      type: 'nha-xuong',
      sub: 'Nhà máy chế biến • 1 MWp',
      province: 'Bình Dương',
      slug: 'dien-mat-troi-nha-may-che-bien-xuat-khau',
      imageUrl: '/images/designs/du-an-6.png',
    },
    {
      id: 'p7',
      title: 'Giải pháp năng lượng xanh',
      type: 'doanh-nghiep',
      sub: 'Trung tâm thương mại • 120 kWp',
      province: 'Đà Nẵng',
      slug: 'giai-phap-dien-mat-troi-resort-da-nang',
      imageUrl: '/images/designs/du-an-7.png',
    },
    {
      id: 'p8',
      title: 'Điện mặt trời cho biệt thự',
      type: 'ho-gia-dinh',
      sub: 'Biệt thự cao cấp • 25 kWp',
      province: 'TP.HCM',
      slug: 'dien-mat-troi-biet-thu-quan-7',
      imageUrl: '/images/designs/du-an-8.png',
    },
    {
      id: 'p9',
      title: 'Hệ thống điện mặt trời tích hợp',
      type: 'doanh-nghiep',
      sub: 'Khách sạn ven biển • 80 kWp',
      province: 'Bình Định',
      slug: 'dien-mat-troi-khach-san-quy-nhon',
      imageUrl: '/images/designs/du-an-9.png',
    },
  ];

  const filteredProjects =
    currentType === 'all'
      ? allProjects
      : allProjects.filter((p) => p.type === currentType);

  return (
    <div className="solar-page solar-page-du-an w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_du-an_desktop.png / mobile.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        {/* Background Hero Banner */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-du-an.png"
            alt="Dự án tiêu biểu BM SOLAR"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle readability gradient on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              DỰ ÁN
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Dự án tiêu biểu <br />
              <span className="text-[#FF6B19]">Giá trị xanh bền vững</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              Khám phá những mô hình ứng dụng điện mặt trời, lưu trữ và hạ tầng sạc.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận tư vấn miễn phí</span>
                <span>→</span>
              </Link>
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
            <span className="text-slate-800 font-semibold">Dự án</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Các mô hình năng lượng đã triển khai */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                01 / DANH MỤC DỰ ÁN
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Các mô hình năng lượng đã triển khai
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Nhận tư vấn dự án</span>
              <span>→</span>
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => {
              const active = currentType === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.slug === 'all' ? '/du-an' : `/du-an?type=${tab.slug}`}
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

          {/* Filter Bar (Dropdowns + Search) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="relative">
              <select className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3A78]">
                <option>Loại dự án: Tất cả</option>
                <option>Hộ gia đình (3kWp - 15kWp)</option>
                <option>Doanh nghiệp (20kWp - 100kWp)</option>
                <option>Nhà xưởng (100kWp - 1MWp+)</option>
                <option>Trạm sạc xe điện EV</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3A78]">
                <option>Khu vực: Tất cả</option>
                <option>Bình Định (Quy Nhơn)</option>
                <option>TP. Hồ Chí Minh</option>
                <option>Bình Dương & Đồng Nai</option>
                <option>Đà Nẵng & Miền Trung</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm dự án theo tên..."
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3A78]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 3x3 Project Grid on Desktop & 2-column on Mobile matching BM_SOLAR_du-an_mobile.png */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-3">
            {filteredProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/du-an/${proj.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/285]"
              >
                {/* Pristine Master Card Crop from BM_SOLAR_du-an_desktop.png */}
                <Image
                  src={proj.imageUrl}
                  alt={proj.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="sr-only">
                  {proj.title} - {proj.sub} ({proj.province})
                </span>
              </Link>
            ))}
          </div>

          {/* Pagination matching Image */}
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

      {/* 4. Section 02: Mỗi dự án — Một giải pháp phù hợp */}
      <ProcessFiveSteps
        tag="02 / NĂNG LỰC TRIỂN KHAI"
        title="Mỗi dự án — Một giải pháp phù hợp"
        rightLinkText="Xem quy trình →"
        rightLinkHref="/giai-phap"
      />

      {/* 5. Section 03: Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
