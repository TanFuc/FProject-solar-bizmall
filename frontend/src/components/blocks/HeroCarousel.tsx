'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Leaf, ShieldCheck, Recycle } from 'lucide-react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
export interface HeroSlide {
  eyebrow?:string;
  benefits?:Array<{iconToken:string;label:string}>;
  title: string;
  subtitle?: string;
  accentPhrase?: string;
  desktopMediaUrl?: string;
  mobileMediaUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}
export function HeroCarousel({ slides = [], fallbackMediaUrl = '/images/designs/hero-home.png' }: { slides?: HeroSlide[]; fallbackMediaUrl?: string }) {
  const [index, setIndex] = useState(0);
  const { openConsultationModal } = useBranch();
  const { t } = useTranslation();
  const current = slides[index % Math.max(slides.length, 1)];
  if (!current) return null;
  const desktop = current.desktopMediaUrl || fallbackMediaUrl;
  const mobile = current.mobileMediaUrl || desktop;
  return <section className="solar-hero">
    <div className="solar-hero-media">
      {desktop && <Image src={desktop} alt="" fill priority sizes="100vw" className="object-cover hidden sm:block" />}
      {mobile && <Image src={mobile} alt="" fill priority sizes="100vw" className="object-cover sm:hidden" />}
    </div>
    <div className="solar-hero-shade" />
    <div className="solar-hero-content">
      {current.eyebrow && <div className="solar-hero-eyebrow">{current.eyebrow}</div>}
      <h1>{current.title}{current.accentPhrase && <em>{current.accentPhrase}</em>}</h1>
      {current.benefits?.length ? <div className="solar-hero-benefits">{current.benefits.map(benefit=>{const Icon=benefit.iconToken==='shield-check'?ShieldCheck:benefit.iconToken==='recycle'?Recycle:Leaf;return <div key={benefit.label}><Icon aria-hidden="true" /><span>{benefit.label}</span></div>})}</div> : current.subtitle && <p>{current.subtitle}</p>}
      <div className="solar-hero-actions">
        <Button onClick={() => openConsultationModal(current.title)} icon={<ArrowRight size={18} />} iconPosition="right">{current.primaryCtaText || t('hero.ctaConsult')}</Button>
        <Button variant="outline" href="/giai-phap">{current.secondaryCtaText || t('hero.ctaSolutions')}</Button>
      </div>
      {slides.length > 1 && <div className="solar-slide-controls">
        <span>{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
        <button onClick={() => setIndex((index - 1 + slides.length) % slides.length)} aria-label="Slide trước"><ChevronLeft /></button>
        <button onClick={() => setIndex((index + 1) % slides.length)} aria-label="Slide tiếp"><ChevronRight /></button>
      </div>}
    </div>
    <svg className="solar-hero-curve" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20Q360 65 720 25T1440 20V40H0Z" fill="#f5f9ff" /></svg>
  </section>;
}
