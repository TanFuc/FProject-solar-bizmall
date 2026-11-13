'use client';

import React from 'react';
import Link from 'next/link';
import { ContentTrack } from '@/components/ui/ContentTrack';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { ProjectItem } from '@/types/bmsolar-api';
import { MapPin, Zap, Calendar, ArrowUpRight } from 'lucide-react';

interface ProjectShowcaseProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  linkLabel?: string;
  projects?: ProjectItem[];
}

export function ProjectShowcase({ projects, title, eyebrow, description, linkLabel }: ProjectShowcaseProps) {
  const { t } = useTranslation();

  if (!projects || projects.length === 0) return null;

  return (
    <section className="solar-projects py-12 lg:py-24 bg-white" id="du-an">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-12 gap-4">
          <div className="max-w-2xl space-y-1.5 sm:space-y-2">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              {eyebrow || t('home.projects.eyebrow')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
              {title || t('projects.title')}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {description || t('home.projects.description')}
            </p>
          </div>
          <Link
            href="/du-an"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <span>{linkLabel || t('projects.viewAll')}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <ContentTrack className="solar-home-card-grid" label={title || t('projects.title')}>
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/du-an/${proj.slug}`}
              className="bg-surface min-w-0 rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              draggable={false}
            >
              <div>
                {/* Drone Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
                  {proj.coverMediaUrl && (
                    <Image
                      src={proj.coverMediaUrl}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 360px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      draggable={false}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {proj.capacityKwp && (
                    <span className="absolute top-3 right-3 bg-accent-orange text-white text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {proj.capacityKwp} kWp
                    </span>
                  )}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white">
                    <span className="text-[11px] sm:text-xs font-semibold text-accent-light/90">
                      {proj.projectType?.name || t('home.projects.solar')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 lg:p-6 space-y-2 sm:space-y-3">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-ink group-hover:text-brand-primary transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {proj.summary}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="p-4 sm:p-5 lg:p-6 pt-0 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] sm:text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-orange" />
                  {proj.province?.name || t('home.projects.country')}
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
        </ContentTrack>
      </div>
    </section>
  );
}

