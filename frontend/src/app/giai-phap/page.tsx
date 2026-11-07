import {CmsJourney,CmsProcess} from '@/components/blocks/CmsSections';
import {getPageVisuals} from '@/lib/api/visuals';
import {visualMetadata} from '@/lib/api/visual-metadata';
import {PageHero} from '@/components/layout/PageHero';
import React from 'react';
import { Metadata } from 'next';
import {VisualImage as Image} from '@/components/ui/VisualImage';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Sun, Zap, BatteryCharging, Plug, Check, ArrowRight } from 'lucide-react';

export async function generateMetadata(){return visualMetadata('solutions','/giai-phap');}

export default async function SolutionsPage() {
 const visuals=await getPageVisuals('solutions');const copy=visuals.copy;
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

          {/* 3 Wide Cards matching BM_SOLAR_giai-phap_desktop.png */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
            {/* Card 1: Hộ gia đình */}
            <a
              href="#household"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src={visuals.media.home}
                alt="Giải pháp Hộ gia đình"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">{copy.content013}</span>
            </a>

            {/* Card 2: Doanh nghiệp */}
            <a
              href="#business"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src={visuals.media.office}
                alt="Giải pháp Doanh nghiệp"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">{copy.content014}</span>
            </a>

            {/* Card 3: Nhà xưởng */}
            <a
              href="#industrial"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/270]"
            >
              <Image
                src={visuals.media.factory}
                alt="Giải pháp Nhà xưởng"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">{copy.content015}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Từ nhu cầu đến hệ thống phù hợp (3 Detail Feature Rows) */}
      <section id="chi-tiet-giai-phap" className="py-10 lg:py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content016}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content017}</h2>
            </div>
            <Link
              href="/lien-he"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content018}</span>
              <span>{copy.content019}</span>
            </Link>
          </div>

          {/* Row 1: Hộ gia đình (Image Left, Content Right) */}
          <div id="household" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm">
              <Image
                src={visuals.media.home}
                alt="Điện mặt trời áp mái cho không gian sống"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">{copy.content020}</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{copy.content021}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{copy.content022}</p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content023}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content024}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content025}</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>{copy.content026}</span>
                  <span>{copy.content027}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Doanh nghiệp (Content Left, Image Right) */}
          <div id="business" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="space-y-4 order-2 lg:order-1">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">{copy.content028}</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{copy.content029}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{copy.content030}</p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content031}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content032}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content033}</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>{copy.content034}</span>
                  <span>{copy.content035}</span>
                </Link>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm order-1 lg:order-2">
              <Image
                src={visuals.media.home}
                alt="Tối ưu chi phí điện cho hoạt động kinh doanh"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Row 3: Nhà xưởng (Image Left, Content Right) */}
          <div id="industrial" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative rounded-2xl overflow-hidden aspect-[600/360] bg-slate-100 shadow-sm">
              <Image
                src={visuals.media.home}
                alt="Hệ thống năng lượng quy mô công nghiệp"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">{copy.content036}</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{copy.content037}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{copy.content038}</p>
              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content039}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content040}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content041}</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-[#FF6B19]/20"
                >
                  <span>{copy.content042}</span>
                  <span>{copy.content043}</span>
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
