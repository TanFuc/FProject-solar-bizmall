import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { RichDocument } from '@/components/ui/RichDocument';
import { getCurrentContentLocale } from '@/lib/api/localized-page';
import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSolutionBySlug, getSolutions } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSolutionSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  CheckCircle2,
  TrendingDown,
  Clock,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface SolutionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: SolutionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const solution = await getSolutionBySlug(slug, locale);
  if (!solution) {
    return constructMetadata({ title: 'Không Tìm Thấy Giải Pháp' });
  }

  return constructMetadata({
    title: `${solution.title} | BM SOLAR`,
    description: solution.subtitle,
    canonicalPath: `/giai-phap/${solution.slug}`,
    contentLocale: locale,
    englishAvailable: solution.hasEnglish,
    ogImage: solution.heroImage,
    keywords: [
      solution.title,
      `điện mặt trời ${solution.capacityRange}`,
      'lắp điện mặt trời BM Solar',
      'pin lưu trữ BESS',
    ],
  });
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const ui = (vi: string, en: string) => locale === "en-US" ? en : vi;
  const solution = await getSolutionBySlug(slug, locale);

  if (!solution) {
    notFound();
  }

  const solutionSchema = getSolutionSchema(solution);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: ui("Trang chủ", "Home"), url: '/' },
    { name: ui("Giải pháp", "Solutions"), url: '/giai-phap' },
    { name: solution.title, url: `/giai-phap/${solution.slug}` },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[solutionSchema, breadcrumbSchema]} />
      {/* 1. Hero Header */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              {ui("Trang chủ", "Home")}
            </Link>
            <span>/</span>
            <Link href="/giai-phap" className="hover:text-white transition-colors">
              {ui("Giải pháp", "Solutions")}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{solution.title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{ui("Công suất:", "Capacity:")} {solution.capacityRange}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            {solution.title}
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            {solution.subtitle}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-white">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg backdrop-blur-sm">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>{ui("Tiết kiệm:", "Savings:")} <strong>{solution.monthlySavings}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg backdrop-blur-sm">
              <Clock className="w-4 h-4 text-accent-orange" />
              <span>{ui("Hoàn vốn:", "Payback:")} <strong>{solution.roiYears}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{ui("Bảo hành:", "Warranty:")} <strong>{solution.warrantyPeriod}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overview & Benefits */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {ui("Mô Tả Tổng Quan Giải Pháp", "Solution overview")}
              </h2>
              <RichDocument value={solution.documentJson || solution.overview} className="solar-document-column" />
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xl font-bold text-ink">{ui("Lợi Ích Thực Tế Đạt Được", "Benefits")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solution.benefits.map((b, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <h4 className="text-sm font-bold text-ink">{b.title}</h4>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed pl-6">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Breakdown Table */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xl font-bold text-ink">{ui("Danh Mục Thiết Bị Cấu Hình Chuẩn", "Typical equipment")}</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-ink font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">{ui("Tên thiết bị / Hạng mục", "Equipment")}</th>
                      <th className="p-3.5">{ui("Hãng sản xuất", "Manufacturer")}</th>
                      <th className="p-3.5">{ui("Bảo hành", "Warranty")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solution.equipmentList.map((eq, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-medium text-ink">{eq.name}</td>
                        <td className="p-3.5 text-slate-600">{eq.brand}</td>
                        <td className="p-3.5 text-emerald-600 font-semibold">{eq.warranty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sticky Card */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-card bg-slate-200">
              <Image
                src={solution.heroImage || '/images/designs/hero-giai-phap.png'}
                alt={solution.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="text-base font-bold text-ink">{ui("Đăng Ký Tư Vấn & Khảo Sát 3D", "Request a consultation and site survey")}</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {ui("Đội ngũ kỹ sư BM SOLAR tại Quy Nhơn và TP.HCM sẽ đo đạc kết cấu mái và xuất bảng tính hoàn vốn chi tiết cho công trình của bạn.", "Our engineers in Quy Nhon and Ho Chi Minh City can survey your roof and prepare an investment estimate.")}
              </p>
              <Button variant="orange" size="lg" fullWidth href="#tu-van">
                {ui("Khảo Sát Miễn Phí", "Request a free survey")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Steps */}
      <section className="py-16 bg-surface border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="text-2xl font-bold text-ink">{ui("Quy Trình Thi Công 5 Bước", "Five-step installation process")}</h3>
            <p className="text-xs sm:text-sm text-ink-muted">{ui("Quy chuẩn kỹ thuật an toàn cao nhất", "Installation and safety standards")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {solution.processSteps.map((p) => (
              <div key={p.step} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-2xl font-black text-brand-primary">0{p.step}</span>
                <h4 className="text-sm font-bold text-ink">{p.title}</h4>
                <p className="text-xs text-ink-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Consultation Form */}
      <ConsultationFormBlock
        headline={ui("Nhận dự toán chi phí cho", "Request an estimate for") + " " + solution.title}
        subheading={ui("Kỹ sư phụ trách khu vực sẽ liên hệ tư vấn phương án công suất và bảng giá tối ưu nhất trong vòng 15 phút.", "An engineer will contact you to discuss system sizing and pricing.")}
      />
      <ContentSuggestions kind="solutions" slug={solution.slug} preferredSlugs={[...(solution.relatedProjectSlugs || []), ...(solution.recommendedProductSlugs || [])]} />
    </div>
  );
}

