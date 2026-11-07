'use client';
import { useTranslation } from '@/lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Factory, House } from 'lucide-react';
import { AudienceItem } from '@/types/bmsolar-api';
const icons = { household: House, business: Building2, industrial: Factory };
export function SolutionShowcase({ audiences, title }: { audiences?: AudienceItem[]; title?: string }) {
  const { t } = useTranslation();
  if (!audiences?.length) return null;
  return <section className="solar-solutions" id="giai-phap">
    <div className="solar-section-heading"><h2>{title || t('solutions.title')}</h2><Link href="/giai-phap" aria-label="Xem tất cả giải pháp"><ArrowRight /></Link></div>
    <div className="solar-audience-grid">{audiences.filter(a => a.enabled).map(audience => {
      const Icon = icons[audience.code];
      return <Link key={audience.id} href={`/giai-phap#${audience.code}`} className="solar-audience-card">
        {audience.imageUrl && <Image src={audience.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />}
        <div className="solar-audience-caption"><Icon aria-hidden="true" /><div><h3>{audience.label}</h3><p>{audience.description}</p></div><ArrowRight className="solar-round-arrow" aria-hidden="true" /></div>
      </Link>;
    })}</div>
  </section>;
}
