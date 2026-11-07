import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getProjects } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { MapPin, Zap, Calendar, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Dự Án Điện Mặt Trời Tiêu Biểu — BM SOLAR',
  description:
    'Khám phá các dự án điện mặt trời áp mái biệt thự, nhà máy may, khách sạn resort do BM SOLAR tổng thầu EPC tại Bình Định, TP.HCM và các tỉnh miền Trung.',
  canonicalPath: '/du-an',
  ogImage: '/images/logo.png',
  keywords: [
    'dự án điện mặt trời',
    'điện mặt trời Quy Nhơn',
    'điện mặt trời áp mái nhà xưởng',
    'dự án điện mặt trời hybrid',
  ],
});

interface ProjectsPageProps {
  searchParams?: {
    type?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const currentTypeSlug = searchParams?.type;
  const projectsResponse = await getProjects();

  let projects = projectsResponse.data;
  if (currentTypeSlug) {
    if (currentTypeSlug === 'hybrid') {
      projects = projects.filter((p) => p.projectType?.slug.includes('hybrid'));
    } else if (currentTypeSlug === 'cong-nghiep') {
      projects = projects.filter((p) => p.projectType?.slug.includes('industrial') || p.projectType?.slug.includes('nha-xuong'));
    } else if (currentTypeSlug === 'thuong-mai') {
      projects = projects.filter((p) => p.projectType?.slug.includes('commercial') || p.projectType?.slug.includes('thuong-mai'));
    }
  }

  const projectTabs = [
    { label: 'Tất cả dự án', slug: '' },
    { label: 'Điện Mặt Trời Có Lưu Trữ (Hybrid)', slug: 'hybrid' },
    { label: 'Nhà Xưởng Công Nghiệp', slug: 'cong-nghiep' },
    { label: 'Thương Mại & Khách Sạn', slug: 'thuong-mai' },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Dự án</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thực Tế & Năng Lực Thi Công</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Thư Viện Dự Án Điện Mặt Trời Đã Hòa Lưới
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Hơn 15MWp công suất lắp đặt an toàn, đạt hiệu suất phát điện vượt cam kết hợp đồng. Khám phá các công trình tiêu biểu do BM SOLAR tổng thầu EPC.
          </p>
        </div>
      </section>

      {/* 2. Project Filters */}
      <section className="sticky top-20 z-30 bg-surface border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-ink-muted flex items-center gap-1.5 mr-2 hidden sm:flex">
              <Filter className="w-3.5 h-3.5" /> Loại hình:
            </span>
            {projectTabs.map((tab) => {
              const isActive =
                (!currentTypeSlug && tab.slug === '') ||
                currentTypeSlug === tab.slug;

              return (
                <Link
                  key={tab.slug}
                  href={tab.slug ? `/du-an?type=${tab.slug}` : '/du-an'}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white text-ink-muted hover:text-ink hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <span className="text-xs text-ink-muted shrink-0 hidden md:block">
            Hiển thị <strong>{projects.length}</strong> dự án
          </span>
        </div>
      </section>

      {/* 3. Project Grid */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/du-an/${proj.slug}`}
              className="bg-surface rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Aerial Drone Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-200">
                  {proj.coverMediaUrl && (
                    <Image
                      src={proj.coverMediaUrl}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {proj.capacityKwp && (
                    <span className="absolute top-3.5 right-3.5 bg-accent-orange text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {proj.capacityKwp} kWp
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-xs font-semibold text-accent-light/90">
                      {proj.projectType?.name || 'Điện mặt trời'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-brand-primary transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {proj.summary}
                  </p>
                </div>
              </div>

              {/* Meta Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-orange" />
                  {proj.province?.name || 'Việt Nam'}
                </span>
                {proj.completedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(proj.completedAt).getFullYear()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Consultation Form */}
      <ConsultationFormBlock
        headline="Khảo Sát Khả Năng Lắp Đặt Dự Án Cho Doanh Nghiệp Bạn"
        subheading="Đội ngũ kỹ sư BM SOLAR sẵn sàng khảo sát thực tế và thiết kế bản vẽ mô phỏng 3D miễn phí."
      />
    </div>
  );
}

