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
  const project = await getProjectBySlug(slug);
  if (!project) {
    return constructMetadata({ title: 'Không Tìm Thấy Dự Án' });
  }

  return constructMetadata({
    title: `${project.title} | BM SOLAR`,
    description: project.summary,
    canonicalPath: `/du-an/${project.slug}`,
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
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const projectSchema = getProjectSchema(project);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Dự án', url: '/du-an' },
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
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/du-an" className="hover:text-white transition-colors">
              Dự án
            </Link>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-xs">{project.title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Công suất hòa lưới: {project.capacityKwp} kWp</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            {project.title}
          </h1>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-accent-orange" />
              {project.province?.name || 'Việt Nam'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              Hoàn thành: {project.completedAt ? new Date(project.completedAt).getFullYear() : '2026'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tổng thầu EPC: BM SOLAR
            </span>
          </div>
        </div>
      </section>

      {/* 2. Project Details Content */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Photo & Story */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative w-full h-80 sm:h-[460px] rounded-2xl overflow-hidden bg-slate-200 shadow-card">
              {project.coverMediaUrl && (
                <Image
                  src={project.coverMediaUrl}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover object-center"
                />
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Thông Tin Chi Tiết Công Trình
              </h2>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                {project.summary}
              </p>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Hệ thống được thiết kế tối ưu hướng nghiêng và khả năng đón nắng cao nhất trong năm, kết hợp giải pháp giám sát thông minh từ xa qua ứng dụng di động. Sau khi đóng điện hòa lưới, công trình đã vận hành ổn định, mang lại hiệu quả kinh tế vượt trội và sự an tâm tuyệt đối cho chủ đầu tư.
              </p>
            </div>

            {/* Highlights */}
            <div className="p-6 rounded-2xl bg-surface border border-slate-200/80 space-y-3">
              <h3 className="text-base font-bold text-ink">Đặc Điểm Kỹ Thuật Dự Án</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ink">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sử dụng tấm pin Tier 1 bảo hành hiệu suất 25 năm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Biến tần Inverter hiệu suất chuyển đổi 98.8%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Hệ thống giám sát sản lượng điện 24/7 qua Cloud</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bảo trì O&M định kỳ miễn phí trong 2 năm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Technical Specs Summary */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-ink border-b border-slate-200 pb-3">
                Thông Số Hệ Thống
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Loại hình:</span>
                  <span className="font-semibold text-ink">{project.projectType?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Công suất lắp đặt:</span>
                  <span className="font-bold text-accent-orange">{project.capacityKwp} kWp</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Địa điểm:</span>
                  <span className="font-semibold text-ink">{project.province?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Năm hoàn thành:</span>
                  <span className="font-semibold text-ink">
                    {project.completedAt ? new Date(project.completedAt).getFullYear() : '2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Tổng thầu EPC:</span>
                  <span className="font-semibold text-brand-primary">BM SOLAR</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="orange" size="md" fullWidth href="#tu-van">
                  Tư Vấn Dự Án Tương Tự
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Consultation Form */}
      <ConsultationFormBlock
        headline="Khảo Sát & Thiết Kế Điện Mặt Trời Cho Dự Án Của Bạn"
        subheading="Liên hệ ngay để nhận bản vẽ 3D và bảng tính toán dòng tiền đầu tư chi tiết."
      />
    </div>
  );
}

