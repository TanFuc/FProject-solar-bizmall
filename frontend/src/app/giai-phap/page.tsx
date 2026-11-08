import { CmsJourney, CmsProcess } from '@/components/blocks/CmsSections';
import { getPageVisuals } from '@/lib/api/visuals';
import { getSolutions } from '@/lib/api/client';
import { visualMetadata } from '@/lib/api/visual-metadata';
import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { Metadata } from 'next';
import { VisualImage as Image } from '@/components/ui/VisualImage';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Sun, Zap, BatteryCharging, Plug, Check, ArrowRight } from 'lucide-react';

export async function generateMetadata() {
  return visualMetadata('solutions', '/giai-phap');
}

export default async function SolutionsPage() {
  const [visuals, solutions] = await Promise.all([getPageVisuals('solutions'), getSolutions()]);
  const copy = visuals.copy;
  const principleSteps = [
    {
      num: '01',
      icon: Sun,
      name: copy.content001,
      desc: copy.content002,
    },
    {
      num: '02',
      icon: Zap,
      name: copy.content003,
      desc: copy.content004,
    },
    {
      num: '03',
      icon: BatteryCharging,
      name: copy.content005,
      desc: copy.content006,
    },
    {
      num: '04',
      icon: Plug,
      name: copy.content007,
      desc: copy.content008,
    },
  ];

  return (
    <div className="solar-page solar-page-giai-phap w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_giai-phap_desktop.png */}
      <PageHero visuals={visuals}/>

      {/* 2. Breadcrumb */}


      {/* 3. Section 01: Các gói giải pháp */}
      <section id="cac-goi-giai-phap" className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content009}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content010}</h2>
            </div>
            <a
              href="#chi-tiet-giai-phap"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content011}</span>
              <span>{copy.content012}</span>
            </a>
          </div>

          {/* Dynamic Solution Cards matching BM_SOLAR design system */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
            {solutions.map((sol, idx) => (
              <Link
                key={sol.id || sol.slug}
                href={`/giai-phap/${sol.slug}`}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
              >
                <Image
                  src={sol.heroImage || (idx === 0 ? visuals.media.home : idx === 1 ? visuals.media.office : visuals.media.factory)}
                  alt={sol.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                    {sol.capacityRange}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold leading-tight group-hover:text-accent-orange transition-colors">
                    {sol.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-1 mt-1 font-normal">
                    {sol.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section 02: Từ nhu cầu đến hệ thống phù hợp (Dynamic Detail Feature Rows from API) */}
      <section id="chi-tiet-giai-phap" className="py-10 lg:py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content016 || 'GIẢI PHÁP TỐI ƯU'}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content017 || 'Từ nhu cầu thực tế đến hệ thống chuẩn mực'}</h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content018 || 'Nhận tư vấn ngay'}</span>
              <span>{copy.content019 || '→'}</span>
            </Link>
          </div>

          {/* Dynamic Solution Rows */}
          <div className="space-y-8">
            {solutions.map((sol, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={sol.id || sol.slug}
                  id={sol.audienceCode || sol.slug}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs"
                >
                  <div className={`relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm ${!isEven ? 'order-1 lg:order-2' : ''}`}>
                    <Image
                      src={sol.heroImage || (index === 0 ? visuals.media.home : index === 1 ? visuals.media.office : visuals.media.factory)}
                      alt={sol.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      {sol.capacityRange}
                    </div>
                  </div>

                  <div className={`space-y-4 ${!isEven ? 'order-2 lg:order-1' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">
                        0{index + 1} / GÓI GIẢI PHÁP
                      </span>
                      {sol.roiYears && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Hoàn vốn {sol.roiYears}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{sol.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {sol.overview || sol.subtitle}
                    </p>

                    {sol.benefits && sol.benefits.length > 0 && (
                      <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                        {sol.benefits.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <strong className="text-slate-900 block font-bold">{b.title}</strong>
                              <span className="text-slate-600 text-xs">{b.desc}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/giai-phap/${sol.slug}`}
                        className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                      >
                        <span>Xem chi tiết giải pháp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/lien-he"
                        className="px-5 py-2.5 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Nhận báo giá dự toán</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Section 03: Từ nguồn điện đến điểm sử dụng (4-Step Diagram) */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content044}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content045}</h2>
            </div>
            <a
              href="#chi-tiet-giai-phap"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content046}</span>
              <span>{copy.content047}</span>
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
      <CmsProcess copy={copy}/>

      {/* 7. Section 05: Bottom CTA Banner */}
      <CmsJourney copy={copy} mediaUrl={visuals.media.factory}/>
    </div>
  );
}
