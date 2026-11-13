import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { projectDocumentFacts } from '@/lib/api/content-body';
import { RichDocument } from '@/components/ui/RichDocument';
import { getCurrentContentLocale, labelsForLocale } from '@/lib/api/localized-page';
import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjects } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProjectSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  MapPin,
  Zap,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.data.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const project = await getProjectBySlug(slug, locale);
  if (!project) {
    return constructMetadata({ title: 'Không Tìm Thấy Dự Án', noIndex: true, canonicalPath: `/du-an/${slug}` });
  }

  return constructMetadata({
    title: `${project.title} | BM SOLAR`,
    description: project.summary,
    canonicalPath: `/du-an/${project.slug}`,
    contentLocale: locale,
    englishAvailable: project.hasEnglish,
    ogImage: project.coverMediaUrl,
    keywords: [
      project.title,
      project.province?.name || 'Bình Định',
      'dự án điện mặt trời',
      'lắp điện mặt trời hòa lưới',
    ],
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const project = await getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const english = locale === "en-US" && project.hasEnglish;
  const ui = (vi: string, en: string) => english ? en : vi;
  const translate = await labelsForLocale(locale);
  const facts = projectDocumentFacts(project.bodyJson);
  const completedYear = project.completedAt ? new Date(project.completedAt).getFullYear() : undefined;
  const details = [
    [ui("Loại hình", "Project type"), project.projectType?.name && translate(project.projectType.name)],
    [ui("Địa điểm", "Location"), translate(facts.location || project.province?.name || "")],
    [ui("Năm hoàn thành", "Year completed"), completedYear],
    [ui("Thời điểm đấu nối", "Grid connection"), facts.connectionDate],
    [ui("Tấm pin", "Solar panels"), facts.panels],
    [ui("Biến tần", "Inverter"), facts.inverter],
    [ui("Pin lưu trữ", "Battery"), facts.battery],
  ].filter(([, value]) => value);
  const projectSchema = getProjectSchema(project);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: english ? "Home" : "Trang chủ", url: '/' },
    { name: english ? "Projects" : "Dự án", url: '/du-an' },
    { name: project.title, url: `/du-an/${project.slug}` },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[projectSchema, breadcrumbSchema]} />
      {/* 1. Header & Breadcrumb */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              {english ? "Home" : "Trang chủ"}
            </Link>
            <span>/</span>
            <Link href="/du-an" className="hover:text-white transition-colors">
              {english ? "Projects" : "Dự án"}
            </Link>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-xs">{project.title}</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            {project.title}
          </h1>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-accent-orange" />
              {translate(project.province?.name || ui('Việt Nam', 'Vietnam'))}
            </span>
            {completedYear && <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md"><Calendar className="w-3.5 h-3.5" />{completedYear}</span>}

          </div>
        </div>
      </section>

      {/* 2. Project Details Content */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Photo & Story */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative w-full h-80 sm:h-[460px] rounded-2xl overflow-hidden bg-slate-200 shadow-card">
              <Image
                src={project.coverMediaUrl || '/images/designs/du-an-1.png'}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                {english ? "Project Details" : "Thông Tin Chi Tiết Công Trình"}
              </h2>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                {project.summary}
              </p>
              <RichDocument value={project.bodyJson} className="solar-document-column" />
            </div>

          </div>

          {/* Right Card: Technical Specs Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-ink border-b border-slate-200 pb-3">
                {ui("Hồ sơ hệ thống", "System overview")}
              </h3>

              <dl className="space-y-3 text-sm">
                {details.map(([label, value]) => <div className="grid gap-1 border-b border-slate-200/80 pb-2" key={label}>
                  <dt className="text-ink-muted">{label}</dt><dd className="font-semibold text-ink">{value}</dd>
                </div>)}
              </dl>

              <div className="pt-2">
                <Button variant="orange" size="md" fullWidth href="#tu-van">
                  {ui("Tư Vấn Dự Án Tương Tự", "Discuss a similar project")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Consultation Form */}
      <ConsultationFormBlock
        headline={ui("Khảo Sát & Thiết Kế Điện Mặt Trời Cho Dự Án Của Bạn", "Solar design and site assessment for your project")}
        subheading={ui("Liên hệ ngay để nhận bản vẽ 3D và bảng tính toán dòng tiền đầu tư chi tiết.", "Contact us to discuss a layout and detailed investment estimate.")}
      />
      <ContentSuggestions kind="projects" slug={slug} group={project.projectType?.slug} />
    </div>
  );
}

