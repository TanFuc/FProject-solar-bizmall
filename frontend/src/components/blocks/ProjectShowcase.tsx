'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectItem } from '@/types/bmsolar-api';
import { MapPin, Zap, Calendar, ArrowUpRight } from 'lucide-react';

interface ProjectShowcaseProps {
  title?:string;
  projects?: ProjectItem[];
}

export function ProjectShowcase({ projects, title }: ProjectShowcaseProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="solar-projects py-16 lg:py-24 bg-white" id="du-an">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Năng Lực Thi Công Thực Tế
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">{title || 'Dự Án Điện Mặt Trời Tiêu Biểu Đã Hoàn Thành'}</h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Trực tiếp thiết kế, cung ứng thiết bị và tổng thầu EPC bởi đội ngũ kỹ sư BM SOLAR tại miền Trung & Nam Bộ.
            </p>
          </div>
          <Link
            href="/du-an"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <span>Xem thư viện tất cả dự án</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/du-an/${proj.slug}`}
              className="bg-surface rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Drone Image */}
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

              {/* Meta */}
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
      </div>
    </section>
  );
}

