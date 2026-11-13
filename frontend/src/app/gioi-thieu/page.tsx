import { aboutImages, aboutImageKey } from '@/lib/api/about-images';
import { safeLink } from '@/lib/api/content-body';
import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { RichDocument } from '@/components/ui/RichDocument';
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
import { Target, Compass, Award, Check, ArrowRight } from 'lucide-react';

export async function generateMetadata(){return visualMetadata('about','/gioi-thieu');}

export default async function AboutPage() {
 const visuals=await getPageVisuals('about');const copy=visuals.copy;
 const image = (slot: keyof typeof aboutImages, alt: string = "") => {
   const key = aboutImageKey(slot);
   return { src: visuals.media[key] ?? visuals.media[aboutImages[slot].fallback], alt: visuals.mediaAlt[key] ?? visuals.mediaAlt[aboutImages[slot].fallback] ?? alt };
 };
 const target = (key: string, fallback: string) => safeLink(copy[key]) || fallback;
  return (
    <div className="solar-page solar-page-gioi-thieu w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_gioi-thieu_desktop.png */}
      <PageHero visuals={visuals}/>

      {/* 2. Breadcrumb */}


      {/* 3. Section 01: BM SOLAR — Nơi công nghệ gặp nhu cầu thực tế */}
      <section id="cau-chuyen-thuong-hieu" className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content001}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content002}</h2>
            </div>
            <Link
              href={target("storyTopLink", "/du-an")}
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content003}</span>
              <span>{copy.content004}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">{copy.content005}</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{copy.content006}</h3>
              {copy.brandStoryDocument ? <RichDocument value={copy.brandStoryDocument} /> : <>
                <p className="text-sm leading-relaxed text-slate-600">{copy.content007}</p>
                <p className="text-sm leading-relaxed text-slate-600">{copy.content008}</p>
              </>}

              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content009}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content010}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{copy.content011}</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href={target("storyBottomLink", "/lien-he")}
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#FF6B19]/20 transition-all"
                >
                  <span>{copy.content012}</span>
                  <span>{copy.content013}</span>
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-[600/400] bg-slate-100 shadow-md">
              <Image
                {...image("story", copy.content014)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{copy.content014}</p>
                  <p className="text-[11px] text-slate-500">{copy.content015}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FF6B19] text-white flex items-center justify-center font-bold">{copy.content016}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Tầm nhìn • Sứ mệnh • Giá trị cốt lõi */}
      <section id="tam-nhin" className="py-10 lg:py-14 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content017}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content018}</h2>
            </div>
            <a
              href={target("valuesLink", "#tam-nhin")}
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content019}</span>
              <span>{copy.content020}</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3A78] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">{copy.content021}</span>
              <h3 className="text-base font-bold text-slate-900">{copy.content022}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{copy.content023}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B19] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">{copy.content024}</span>
              <h3 className="text-base font-bold text-slate-900">{copy.content025}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{copy.content026}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">{copy.content027}</span>
              <h3 className="text-base font-bold text-slate-900">{copy.content028}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{copy.content029}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Một hệ thống — Nhiều giá trị (3 Cards matching BM_SOLAR_gioi-thieu_desktop.png) */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content030}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content031}</h2>
            </div>
            <Link
              href={target("benefitsLink", "/giai-phap")}
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content032}</span>
              <span>{copy.content033}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Link
              href={target("benefitHomeLink", "/giai-phap")}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                {...image("benefitHome", copy.content034)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="solar-photo-caption">{copy.content034}</span>
            </Link>

            <Link
              href={target("benefitFactoryLink", "/giai-phap")}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                {...image("benefitFactory", copy.content035)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="solar-photo-caption">{copy.content035}</span>
            </Link>

            <Link
              href={target("benefitEvLink", "/giai-phap")}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                {...image("benefitEv", copy.content036)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="solar-photo-caption">{copy.content036}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Section 04: Trải nghiệm rõ ràng. Quy trình minh bạch. */}
      <CmsProcess copy={copy} count={4} link={target("processTarget", "/giai-phap")} />

      {/* 7. Section 05: Khám phá BM SOLAR qua hình ảnh */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">{copy.content037}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{copy.content038}</h2>
            </div>
            <Link
              href={target("galleryLink", "/du-an")}
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{copy.content039}</span>
              <span>{copy.content040}</span>
            </Link>
          </div>

          <div className="solar-about-gallery"><div><Image {...image("galleryEv", "")} fill sizes="(max-width:767px) 100vw,40vw" className="object-cover"/></div><div><Image {...image("galleryHome", "")} fill sizes="(max-width:767px) 50vw,30vw" className="object-cover"/></div><div><Image {...image("galleryFactory", "")} fill sizes="(max-width:767px) 50vw,30vw" className="object-cover"/></div></div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <CmsJourney copy={copy} mediaUrl={image("journey").src} primaryHref={target("journeyPrimaryTarget", "/lien-he#tu-van")} secondaryHref={target("journeySecondaryTarget", "/du-an")} />
      <ContentSuggestions  />
    </div>
  );
}
