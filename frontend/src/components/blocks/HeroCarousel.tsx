'use client';

import React from 'react';
import Image from 'next/image';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Zap, Sparkles, PhoneCall } from 'lucide-react';

interface HeroSlide {
  title: string;
  accentPhrase?: string;
  subtitle: string;
  desktopMediaUrl: string;
  mobileMediaUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const { openConsultationModal } = useBranch();
  const { t, isEnglish } = useTranslation();

  const currentSlide = slides?.[0] || {
    title: isEnglish
      ? 'PREMIUM ROOFTOP SOLAR PV & ENERGY STORAGE SOLUTIONS'
      : 'GIẢI PHÁP ĐIỆN MẶT TRỜI & LƯU TRỮ NĂNG LƯỢNG CAO CẤP',
    accentPhrase: isEnglish ? 'SAVE UP TO 90% ON POWER COSTS' : 'TIẾT KIỆM ĐẾN 90% CHI PHÍ ĐIỆN',
    subtitle: isEnglish
      ? 'Leading turnkey EPC contractor in Vietnam. Tier 1 Bloomberg equipment, 25-year performance warranty, 100% free on-site 3D survey.'
      : 'Tổng thầu EPC uy tín hàng đầu miền Trung và Nam Bộ. Cam kết thiết bị Tier 1 chính hãng, bảo hành hiệu suất 25 năm, kỹ sư khảo sát 3D tận nơi miễn phí.',
    desktopMediaUrl:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1920&q=85',
    mobileMediaUrl:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=85',
    primaryCtaText: t('hero.ctaConsult'),
    secondaryCtaText: t('hero.ctaSolutions'),
  };

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[700px] flex items-center overflow-hidden bg-brand-darker">
      {/* Background Image with priority loading for LCP */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentSlide.desktopMediaUrl}
          alt={currentSlide.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Cinematic Navy Left-Side Gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker/95 via-brand-dark/85 to-brand-darker/40 lg:to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darker/90 via-transparent to-black/20 z-10 lg:hidden" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-accent-orange animate-ping" />
            <Sparkles className="w-4 h-4 text-accent-orange" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {currentSlide.title}{' '}
            {currentSlide.accentPhrase && (
              <span className="text-accent-orange block mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                {currentSlide.accentPhrase}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/85 leading-relaxed font-normal max-w-2xl">
            {currentSlide.subtitle}
          </p>

          {/* Dual CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
            <Button
              variant="orange"
              size="lg"
              className="text-sm sm:text-base shadow-2xl py-4 sm:py-3.5"
              icon={<Sparkles className="w-5 h-5 text-white" />}
              onClick={() => openConsultationModal('Bấm nút Khảo Sát Báo Giá từ Hero Banner')}
            >
              {currentSlide.primaryCtaText || t('hero.ctaConsult')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              href="/giai-phap"
              className="text-sm sm:text-base py-4 sm:py-3.5 font-medium"
            >
              {currentSlide.secondaryCtaText || t('hero.ctaSolutions')}
            </Button>
          </div>

          {/* Golden Metrics / Highlights */}
          <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-4 text-white">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-accent-orange">
                <Zap className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black text-white">{isEnglish ? '25 Yrs' : '25 Năm'}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/70">{isEnglish ? 'Linear Warranty' : 'Bảo hành hiệu suất'}</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/70">{isEnglish ? 'Tier 1 Certified' : 'Thiết bị Tier 1'}</p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-blue-400">
                <PhoneCall className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-black text-white">24/7</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/70">{isEnglish ? 'Support Engineers' : 'Kỹ sư túc trực'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

