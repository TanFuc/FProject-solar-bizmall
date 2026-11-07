import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Sun, Zap, BatteryCharging, Plug, Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Giải Pháp Năng Lượng Xanh Cho Mọi Nhu Cầu | BM SOLAR',
  description:
    'Giải pháp điện mặt trời áp mái và lưu trữ năng lượng BESS cho hộ gia đình, doanh nghiệp, nhà xưởng quy mô từ 3kWp đến hàng MWp do BM SOLAR triển khai.',
  canonicalPath: '/giai-phap',
  ogImage: '/images/designs/hero-giai-phap.png',
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
      desc: 'Hấp thụ quang năng',
    },
    {
      num: '02',
      icon: Zap,
      name: 'Inverter',
      desc: 'Chuyển đổi DC - AC',
    },
    {
      num: '03',
      icon: BatteryCharging,
      name: 'Lưu trữ BESS',
      desc: 'Tích trữ điện năng',
    },
    {
      num: '04',
      icon: Plug,
      name: 'Thiết bị phụ tải',
      desc: 'Điểm sử dụng điện',
    },
  ];

  return (
    <div className="solar-page solar-page-giai-phap w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_giai-phap_desktop.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-giai-phap.png"
            alt="Giải pháp năng lượng xanh BM SOLAR"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              GIẢI PHÁP
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Giải pháp năng lượng xanh <br />
              <span className="text-[#FF6B19]">cho mọi nhu cầu</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              Từ hộ gia đình đến nhà xưởng công nghiệp, chúng tôi cung cấp giải pháp tối ưu.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận tư vấn giải pháp</span>
                <span>→</span>
              </Link>
              <a
                href="#cac-goi-giai-phap"
                className="px-5 py-2.5 sm:py-3 rounded-full border border-white/40 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Xem các gói
              </a>
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
            <span className="text-slate-800 font-semibold">Giải pháp</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Các gói giải pháp */}
      <section id="cac-goi-giai-phap" className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                01 / CÁC GÓI GIẢI PHÁP
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Giải pháp dành riêng cho bạn
              </h2>
            </div>
            <a
              href="#chi-tiet-giai-phap"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Khám phá tất cả gói</span>
              <span>→</span>
            </a>
          </div>

          {/* 3 Wide Cards matching BM_SOLAR_giai-phap_desktop.png */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
            {/* Card 1: Hộ gia đình */}
            <a
              href="#ho-gia-dinh"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src="/images/designs/giai-phap-card-1.png"
                alt="Giải pháp Hộ gia đình"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Giải pháp Hộ gia đình</span>
            </a>

            {/* Card 2: Doanh nghiệp */}
            <a
              href="#doanh-nghiep"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src="/images/designs/giai-phap-card-2.png"
                alt="Giải pháp Doanh nghiệp"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Giải pháp Doanh nghiệp</span>
            </a>

            {/* Card 3: Nhà xưởng */}
            <a
              href="#nha-xuong"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src="/images/designs/giai-phap-card-3.png"
                alt="Giải pháp Nhà xưởng"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Giải pháp Nhà xưởng</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Từ nhu cầu đến hệ thống phù hợp (3 Detail Feature Rows) */}
      <section id="chi-tiet-giai-phap" className="py-10 lg:py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                02 / TƯ VẤN HỆ THỐNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Từ nhu cầu đến hệ thống phù hợp
              </h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Nhận tư vấn</span>
              <span>→</span>
            </Link>
          </div>

          {/* Row 1: Hộ gia đình (Image Left, Content Right) */}
          <div id="ho-gia-dinh" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm">
              <Image
                src="/images/designs/giai-phap-feature-1.png"
                alt="Điện mặt trời áp mái cho không gian sống"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">
                01 / HỘ GIA ĐÌNH
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Điện mặt trời áp mái cho không gian sống
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Giải pháp tiết kiệm điện năng cho hộ gia đình với chi phí hợp lý và hoàn vốn nhanh.
              </p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tiết kiệm chi phí điện sinh hoạt</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Chủ động nguồn điện liên tục</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Bảo vệ môi trường sống xanh</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>Khám phá giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Doanh nghiệp (Content Left, Image Right) */}
          <div id="doanh-nghiep" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="space-y-4 order-2 lg:order-1">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">
                02 / DOANH NGHIỆP
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Tối ưu chi phí điện cho hoạt động kinh doanh
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tối ưu chi phí vận hành cho văn phòng, khách sạn, trung tâm thương mại.
              </p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giảm áp lực chi phí tiền điện</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Nâng cao uy tín thương hiệu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tối ưu hóa nguồn tài chính</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>Khám phá giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm order-1 lg:order-2">
              <Image
                src="/images/designs/giai-phap-feature-2.png"
                alt="Tối ưu chi phí điện cho hoạt động kinh doanh"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 3: Nhà xưởng (Image Left, Content Right) */}
          <div id="nha-xuong" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm">
              <Image
                src="/images/designs/giai-phap-feature-3.png"
                alt="Hệ thống năng lượng quy mô công nghiệp"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">
                03 / NHÀ XƯỞNG
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Hệ thống năng lượng quy mô công nghiệp
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hệ thống công suất lớn giúp doanh nghiệp đạt chứng chỉ xanh và tiết kiệm chi phí.
              </p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giảm tải hệ thống điện lưới</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Đạt chuẩn xuất khẩu quốc tế</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Tự chủ nguồn năng lượng</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>Khám phá giải pháp</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Từ nguồn điện đến điểm sử dụng (4-Step Diagram) */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                03 / NGUYÊN LÝ HOẠT ĐỘNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Từ nguồn điện đến điểm sử dụng
              </h2>
            </div>
            <a
              href="#chi-tiet-giai-phap"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Tìm hiểu chi tiết</span>
              <span>→</span>
            </a>
          </div>

          <div className="bg-[#F0F6FD] rounded-3xl p-6 sm:p-10 border border-[#D5E5F7]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
              {principleSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#0B3A78] flex items-center justify-center shadow-xs border border-slate-100">
                      <Icon className="w-7 h-7 text-[#0B3A78]" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{step.name}</span>
                    <span className="text-xs text-slate-500 leading-tight">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 04: 5 bước rõ ràng — Dễ theo dõi */}
      <ProcessFiveSteps
        tag="04 / QUY TRÌNH TRIỂN KHAI"
        title="5 bước rõ ràng — Dễ theo dõi"
        rightLinkText="Quy trình chi tiết →"
        rightLinkHref="/lien-he"
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
