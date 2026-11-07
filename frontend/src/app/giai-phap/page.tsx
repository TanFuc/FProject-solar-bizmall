import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Sun, Zap, BatteryCharging, Power, Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Giải Pháp Năng Lượng Xanh Cho Mọi Nhu Cầu | BM SOLAR',
  description:
    'Giải pháp điện mặt trời áp mái và lưu trữ năng lượng BESS cho hộ gia đình, doanh nghiệp, nhà xưởng quy mô từ 3kWp đến hàng MWp do BM SOLAR triển khai.',
  canonicalPath: '/giai-phap',
  ogImage: '/images/logo.png',
  keywords: [
    'giải pháp điện mặt trời',
    'điện mặt trời gia đình',
    'điện mặt trời doanh nghiệp',
    'điện mặt trời nhà xưởng',
    'pin lưu trữ BESS',
    'zero export hòa lưới bám tải',
  ],
});

export default function SolutionsPage() {
  const principleSteps = [
    {
      num: '01',
      icon: Sun,
      name: 'Tấm pin PV',
      desc: 'Thu năng lượng mặt trời',
    },
    {
      num: '02',
      icon: Zap,
      name: 'Inverter',
      desc: 'Chuyển đổi dòng điện DC-AC',
    },
    {
      num: '03',
      icon: BatteryCharging,
      name: 'Lưu trữ BESS',
      desc: 'Tích trữ điện dư thừa',
    },
    {
      num: '04',
      icon: Power,
      name: 'Tiêu thụ điện',
      desc: 'Cung cấp cho thiết bị',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_giai-phap_desktop.png */}
      <section className="relative w-full min-h-[380px] lg:min-h-[440px] flex items-center bg-[#071F3D] overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85"
            alt="Giải pháp năng lượng xanh BM SOLAR"
            fill
            priority
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/95 via-[#071F3D]/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
              GIẢI PHÁP
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Giải pháp năng lượng xanh <br />
              <span className="text-accent-orange">cho mọi nhu cầu</span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1">
              Từ hộ gia đình, doanh nghiệp vừa và nhỏ đến khu công nghiệp quy mô lớn.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận tư vấn ngay</span>
                <span>→</span>
              </Link>
              <a
                href="#cac-goi-giai-phap"
                className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Xem giải pháp
              </a>
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
            <span className="text-slate-800">Giải pháp</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Giải pháp dành riêng cho bạn */}
      <section id="cac-goi-giai-phap" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                01 / CÁC GÓI GIẢI PHÁP
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Giải pháp dành riêng cho bạn
              </h2>
            </div>
            <a
              href="#chi-tiet-giai-phap"
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem toàn bộ giải pháp</span>
              <span>→</span>
            </a>
          </div>

          {/* 3 Wide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Card 1: Hộ gia đình */}
            <a
              href="#ho-gia-dinh"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]"
            >
              <Image
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                alt="Hộ gia đình"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Hộ gia đình
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange group-hover:bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* Card 2: Doanh nghiệp */}
            <a
              href="#doanh-nghiep"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]"
            >
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                alt="Doanh nghiệp"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Doanh nghiệp
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange group-hover:bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* Card 3: Nhà xưởng */}
            <a
              href="#nha-xuong"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]"
            >
              <Image
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                alt="Nhà xưởng"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Nhà xưởng
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange group-hover:bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Từ nhu cầu đến hệ thống phù hợp (3 Detail Rows) */}
      <section id="chi-tiet-giai-phap" className="py-12 lg:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                02 / TƯ VẤN HỆ THỐNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Từ nhu cầu đến hệ thống phù hợp
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Tư vấn ngay</span>
              <span>→</span>
            </Link>
          </div>

          {/* Row 1: Hộ gia đình */}
          <div id="ho-gia-dinh" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="Điện mặt trời áp mái cho không gian sống"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
                DÀNH CHO GIA ĐÌNH
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Điện mặt trời áp mái cho không gian sống
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Giải pháp tiết kiệm điện năng cho hộ gia đình với chi phí hợp lý và hoàn vốn nhanh.
              </p>
              <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tiết kiệm 70 - 90% chi phí điện</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tùy chọn có lưu trữ (Hybrid BESS)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Vận hành êm ái, an toàn</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/giai-phap/ho-gia-dinh"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/20 inline-flex items-center gap-2"
                >
                  <span>Xem chi tiết giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Doanh nghiệp */}
          <div id="doanh-nghiep" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="space-y-4 order-2 lg:order-1">
              <span className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
                DÀNH CHO DOANH NGHIỆP
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Tối ưu chi phí điện cho hoạt động kinh doanh
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Phù hợp khách sạn, tòa nhà văn phòng, showroom thương mại và chuỗi dịch vụ.
              </p>
              <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giảm chi phí điện giờ cao điểm</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Nâng tầm hình ảnh doanh nghiệp xanh</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tự chủ nguồn điện liên tục</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/giai-phap/doanh-nghiep"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/20 inline-flex items-center gap-2"
                >
                  <span>Xem chi tiết giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                alt="Tối ưu chi phí điện cho hoạt động kinh doanh"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 3: Nhà xưởng */}
          <div id="nha-xuong" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                alt="Hệ thống năng lượng quy mô công nghiệp"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
                DÀNH CHO NHÀ XƯỞNG
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Hệ thống năng lượng quy mô công nghiệp
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thiết kế riêng cho các khu công nghiệp, nhà máy sản xuất quy mô từ 100kWp đến hàng MWp.
              </p>
              <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Công suất từ 100kWp đến hàng MWp</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Đạt chuẩn PCCC & thỏa thuận EVN</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giảm dấu chân carbon, đạt chứng chỉ xanh</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/giai-phap/nha-xuong"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/20 inline-flex items-center gap-2"
                >
                  <span>Xem chi tiết giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Từ nguồn điện đến điểm sử dụng (Principle Flow) */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                03 / NGUYÊN LÝ HOẠT ĐỘNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Từ nguồn điện đến điểm sử dụng
              </h2>
            </div>
            <Link
              href="/san-pham"
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem chi tiết thiết bị</span>
              <span>→</span>
            </Link>
          </div>

          {/* 4 Flow Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {principleSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center relative group hover:border-brand-primary transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{step.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Section 04: 5 bước rõ ràng — Dễ theo dõi */}
      <ProcessFiveSteps
        tag="04 / QUY TRÌNH TRIỂN KHAI"
        title="5 bước rõ ràng — Dễ theo dõi"
        rightLinkText="Quy trình chi tiết →"
        rightLinkHref="/giai-phap"
      />

      {/* 7. Section 05: Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
