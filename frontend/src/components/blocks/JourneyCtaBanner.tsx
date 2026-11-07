'use client';

import React from 'react';
import Link from 'next/link';
import { useBranch } from '@/lib/contacts/branchContext';
import { ArrowRight } from 'lucide-react';

interface JourneyCtaBannerProps {
  primaryCtaText?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function JourneyCtaBanner({
  primaryCtaText = 'Nhận tư vấn giải pháp →',
  secondaryCtaText = 'Xem các dự án',
  secondaryCtaHref = '/du-an',
}: JourneyCtaBannerProps) {
  const { openConsultationModal } = useBranch();

  return (
    <section className="bg-gradient-to-r from-[#07244C] via-[#0B3A78] to-[#0D4EA6] text-white py-14 lg:py-16 relative overflow-hidden">
      {/* Decorative subtle ambient lights */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent-orange/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Text */}
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
              KẾT NỐI CÙNG BM SOLAR
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Bắt đầu hành trình <span className="text-accent-orange">năng lượng xanh của bạn</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-1">
              Để lại nhu cầu, đội ngũ chuyên môn sẽ hỗ trợ lựa chọn giải pháp phù hợp và khảo sát 3D miễn phí.
            </p>
          </div>

          {/* Right CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => openConsultationModal('Bắt đầu hành trình năng lượng xanh CTA')}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-lg shadow-accent-orange/30 active:scale-95 transition-all"
            >
              {primaryCtaText}
            </button>

            <Link
              href={secondaryCtaHref}
              className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              {secondaryCtaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
