import { getAudiences } from '@/lib/api/client';
import { CategoryStrip } from '@/components/blocks/CategoryStrip';
import { SolutionShowcase } from '@/components/blocks/SolutionShowcase';
import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';

import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { ChevronDown, Search } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Thiết Bị Chính Hãng — Hiệu Suất Đỉnh Cao | BM SOLAR',
  description:
    'Phân phối thiết bị điện mặt trời chính hãng Tier 1 Bloomberg: Biến tần Deye, Huawei, Tấm pin Canadian Solar, Jinko 550W+ và Pin lưu trữ Lithium Dyness BESS.',
  canonicalPath: '/san-pham',
  ogImage: '/images/designs/hero-san-pham.png',
  keywords: [
    'thiết bị điện mặt trời',
    'tấm pin Canadian Solar',
    'biến tần Deye',
    'inverter Huawei',
    'pin lưu trữ Dyness',
  ],
});

interface ProductsPageProps {
  searchParams?: {
    category?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const audienceRows = await getAudiences();
  const currentCategory = searchParams?.category || 'all';

  const categoryCards = [
    { name: 'Tấm pin quang điện', img: '/images/designs/cat-panel.png', slug: 'tam-pin-nang-luong-mat-troi' },
    { name: 'Biến tần Inverter', img: '/images/designs/cat-inverter.png', slug: 'bien-tan-inverter' },
    { name: 'Pin lưu trữ BESS', img: '/images/designs/cat-battery.png', slug: 'pin-luu-tru-lithium' },
    { name: 'Trạm sạc xe điện', img: '/images/designs/cat-charger.png', slug: 'tram-sac-xe-dien' },
    { name: 'Phụ kiện & Hệ khung', img: '/images/designs/cat-accessories.png', slug: 'phu-kien-lap-dat' },
  ];

  const categoryTabs = [
    { label: 'Tất cả', slug: 'all' },
    { label: 'Tấm pin PV', slug: 'tam-pin' },
    { label: 'Biến tần Inverter', slug: 'inverter' },
    { label: 'Pin lưu trữ', slug: 'bess' },
    { label: 'Trạm sạc EV', slug: 'tram-sac' },
  ];

  const products = [
    { id: 'sp1', title: 'Tấm pin Jinko Solar 550W', brand: 'Jinko Solar', spec: 'Hiệu suất 21.5% • Bảo hành 25 năm', img: '/images/designs/san-pham-1.png', slug: 'tam-pin-jinko-solar-tiger-neo-550w' },
    { id: 'sp2', title: 'Biến tần Deye Hybrid 5kW', brand: 'Deye', spec: '1 pha 5kW • Tích hợp MPPT kép', img: '/images/designs/san-pham-2.png', slug: 'inverter-deye-hybrid-5kw-1-pha' },
    { id: 'sp3', title: 'Biến tần Huawei SUN2000 10kW', brand: 'Huawei', spec: '3 pha 10kW • Hiệu suất 98.6%', img: '/images/designs/san-pham-3.png', slug: 'inverter-huawei-sun2000-10ktl-m1' },
    { id: 'sp4', title: 'Pin lưu trữ Dyness 5.12kWh', brand: 'Dyness', spec: 'LiFePO4 • 6000 chu kỳ sạc xả', img: '/images/designs/san-pham-4.png', slug: 'pin-luu-tru-dyness-b4850-5kwh' },
    { id: 'sp5', title: 'Trạm sạc AC 22kW EV', brand: 'BM EV', spec: 'Chuẩn Type 2 • Chống nước IP65', img: '/images/designs/san-pham-5.png', slug: 'tram-sac-xe-dien-ac-22kw' },
    { id: 'sp6', title: 'Tấm pin Canadian Solar 600W', brand: 'Canadian Solar', spec: 'Hi-Ku7 Mono • Bạc mặt trời', img: '/images/designs/san-pham-6.png', slug: 'tam-pin-canadian-solar-600w-bifacial' },
    { id: 'sp7', title: 'Biến tần Growatt MID 20kW', brand: 'Growatt', spec: '3 pha 20kW • AFCI bảo vệ cháy', img: '/images/designs/san-pham-7.png', slug: 'inverter-growatt-mid-20ktl3-x' },
    { id: 'sp8', title: 'Hệ thống phụ kiện & tủ điện', brand: 'BM Standard', spec: 'Đạt chuẩn IEC 61439 • Chống sét Lan', img: '/images/designs/san-pham-8.png', slug: 'tu-dien-chuyen-dung-solar-chong-set' },
  ];

  return (
    <div className="solar-page solar-page-san-pham w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_san-pham_desktop.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-san-pham.png"
            alt="Thiết bị chính hãng BM SOLAR"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              THIẾT BỊ & CÔNG NGHỆ
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Thiết bị chính hãng <br />
              <span className="text-[#FF6B19]">Hiệu suất đỉnh cao</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              Phân phối chính hãng các dòng tấm pin, biến tần Inverter, pin lưu trữ và trạm sạc hàng đầu thế giới.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận báo giá thiết bị</span>
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
            <span className="text-slate-800 font-semibold">Sản phẩm</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Danh mục thiết bị (5 Category Tiles) */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                01 / DANH MỤC THIẾT BỊ
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hệ sinh thái thiết bị điện mặt trời
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Tư vấn chọn thiết bị</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
            {categoryCards.map((cat) => (
              <Link
                key={cat.slug}
                href={`/san-pham?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-50 border border-slate-100 aspect-[235/180]"
              >
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="sr-only">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section 02: Tất cả sản phẩm (Grid matching BM_SOLAR_san-pham_desktop.png) */}
      <section className="py-10 lg:py-14 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                02 / THIẾT BỊ CHÍNH HÃNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Thiết bị & Phụ kiện năng lượng mặt trời
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Tải bảng giá tổng hợp</span>
              <span>→</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => {
              const active = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.slug === 'all' ? '/san-pham' : `/san-pham?category=${tab.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    active
                      ? 'bg-[#FF6B19] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Product Cards Grid: 4 columns desktop, 2 columns mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pt-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/san-pham/${p.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-white aspect-[300/380] border border-slate-200/80"
              >
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="sr-only">
                  {p.title} - {p.brand} ({p.spec})
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

      {/* 5. Blue Process Section */}
      <SolutionShowcase audiences={audienceRows} />

      {/* 6. Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận báo giá thiết bị ngay →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
