import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { ChevronDown, Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Thiết Bị & Công Nghệ Tiêu Chuẩn Quốc Tế | Sản Phẩm BM SOLAR',
  description:
    'Phân phối thiết bị điện mặt trời chính hãng Tier 1 Bloomberg: Biến tần Deye, Huawei, Tấm pin Canadian Solar, Jinko 550W+ và Pin lưu trữ Lithium Dyness BESS.',
  canonicalPath: '/san-pham',
  ogImage: '/images/logo.png',
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

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const currentCategory = searchParams?.category || 'all';

  const categoryTabs = [
    { label: 'Tất cả thiết bị', slug: 'all' },
    { label: 'Tấm pin PV', slug: 'tam-pin' },
    { label: 'Biến tần Inverter', slug: 'inverter' },
    { label: 'Pin lưu trữ BESS', slug: 'pin-luu-tru' },
    { label: 'Trạm sạc EV', slug: 'tram-sac-ev' },
  ];

  const products = [
    {
      id: 'prod_01',
      name: 'Tấm pin Canadian Solar TOPCon 550W+ BiHiKu7',
      brand: 'Canadian Solar',
      category: 'tam-pin',
      categoryLabel: 'Tấm pin PV',
      specs: 'Công suất 550W - 670W • Hiệu suất 21.6%',
      warranty: 'Bảo hành 25 năm',
      tier: 'Tier 1 Bloomberg',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      slug: 'tam-pin-canadian-solar-550w-topcon',
    },
    {
      id: 'prod_02',
      name: 'Biến tần Inverter Hybrid Deye 8kW - 12kW 3 Pha',
      brand: 'Deye Energy',
      category: 'inverter',
      categoryLabel: 'Biến tần Inverter',
      specs: 'Công suất 8 - 12kW • Tích hợp sạc xả pin lưu trữ',
      warranty: 'Bảo hành 5 năm',
      tier: 'Top 1 Inverter Hybrid',
      imageUrl: 'https://images.unsplash.com/photo-1558441719-f0a5f7823e59?auto=format&fit=crop&w=600&q=80',
      slug: 'inverter-hybrid-deye-12kw-3pha',
    },
    {
      id: 'prod_03',
      name: 'Pin Lưu Trữ Lithium Dyness LiFePO4 5.12kWh - 10kWh',
      brand: 'Dyness Battery',
      category: 'pin-luu-tru',
      categoryLabel: 'Pin lưu trữ BESS',
      specs: 'Dung lượng 5.12kWh - 10.24kWh • 6.000 chu kỳ sạc',
      warranty: 'Bảo hành 10 năm',
      tier: 'LiFePO4 An toàn cao',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      slug: 'pin-luu-tru-lithium-dyness-10kwh',
    },
    {
      id: 'prod_04',
      name: 'Biến tần Hòa Lưới Huawei SUN2000 50KTL / 100KTL',
      brand: 'Huawei FusionSolar',
      category: 'inverter',
      categoryLabel: 'Biến tần Inverter',
      specs: 'Công suất 50kW - 100kW • AFCI thông minh chống cháy nổ',
      warranty: 'Bảo hành 5 năm',
      tier: 'Thương mại & Công nghiệp',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      slug: 'inverter-huawei-sun2000-100ktl',
    },
    {
      id: 'prod_05',
      name: 'Tấm pin Jinko Solar Tiger Pro 545W N-Type',
      brand: 'Jinko Solar',
      category: 'tam-pin',
      categoryLabel: 'Tấm pin PV',
      specs: 'Công suất 545W • Công nghệ TOPCon Cell 9BB',
      warranty: 'Bảo hành 25 năm',
      tier: 'Tier 1 Bloomberg',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=600&q=80',
      slug: 'tam-pin-jinko-tiger-pro-545w',
    },
    {
      id: 'prod_06',
      name: 'Trạm Sạc Xe Điện Thông Minh BM SOLAR EV Wallbox 7kW - 22kW',
      brand: 'BM SOLAR EV',
      category: 'tram-sac-ev',
      categoryLabel: 'Trạm sạc EV',
      specs: 'Công suất 7kW - 22kW • Kết nối ứng dụng theo dõi',
      warranty: 'Bảo hành 3 năm',
      tier: 'Chuẩn Châu Âu Type 2',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80',
      slug: 'tram-sac-xe-dien-wallbox-22kw',
    },
  ];

  const filteredProducts =
    currentCategory === 'all'
      ? products
      : products.filter((p) => p.category === currentCategory);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_san-pham_desktop.png */}
      <section className="relative w-full min-h-[380px] lg:min-h-[440px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558441719-f0a5f7823e59?auto=format&fit=crop&w=1920&q=85"
            alt="Thiết bị & Công nghệ BM SOLAR"
            fill
            priority
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/95 via-[#071F3D]/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
              SẢN PHẨM
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Thiết bị & Công nghệ <br />
              <span className="text-accent-orange">Tiêu chuẩn quốc tế</span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1">
              Phân phối chính hãng tấm pin quang điện, biến tần inverter và hệ thống pin lưu trữ lithium BESS.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận báo giá thiết bị</span>
                <span>→</span>
              </Link>
              <Link
                href="/giai-phap"
                className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Xem giải pháp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Sản phẩm</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Danh mục thiết bị */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                01 / THIẾT BỊ CHÍNH HÃNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Thiết bị & Phụ kiện năng lượng mặt trời
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Tải bảng giá tổng hợp</span>
              <span>→</span>
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => {
              const active = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.slug === 'all' ? '/san-pham' : `/san-pham?category=${tab.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    active
                      ? 'bg-accent-orange text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-primary transition-all duration-300 flex flex-col group"
              >
                {/* Image Container */}
                <div className="h-52 relative bg-slate-100 overflow-hidden">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{p.tier}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-orange/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{p.warranty}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
                      {p.brand}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {p.specs}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Tình trạng</p>
                      <p className="text-xs font-bold text-emerald-600">Sẵn hàng tại kho</p>
                    </div>

                    <Link
                      href={`/san-pham/${p.slug}`}
                      className="px-4 py-2 rounded-full bg-slate-100 group-hover:bg-accent-orange text-slate-700 group-hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section 02: Blue Process Section */}
      <ProcessFiveSteps
        tag="02 / TIÊU CHUẨN THIẾT BỊ"
        title="Cam kết chất lượng chuẩn quốc tế"
        rightLinkText="Xem chứng chỉ →"
        rightLinkHref="/gioi-thieu"
      />

      {/* 5. Section 03: Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận báo giá thiết bị ngay →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
