'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { ShieldCheck, Award, MapPin, Zap } from 'lucide-react';

interface FeatureItem {
  iconToken: string;
  label: string;
  description: string;
}

interface FeatureHighlightsProps {
  items?: FeatureItem[];
}

export function FeatureHighlights({ items }: FeatureHighlightsProps) {
  const { t } = useTranslation();

  const defaultItems: FeatureItem[] = [
    {
      iconToken: 'shield-check',
      label: t('features.f2.title'),
      description: t('features.f2.desc'),
    },
    {
      iconToken: 'award',
      label: t('features.f3.title'),
      description: t('features.f3.desc'),
    },
    {
      iconToken: 'map-pin',
      label: t('features.f1.title'),
      description: t('features.f1.desc'),
    },
    {
      iconToken: 'zap',
      label: t('features.f4.title'),
      description: t('features.f4.desc'),
    },
  ];

  const displayItems = items && items.length > 0 ? items : defaultItems;

  const renderIcon = (token: string) => {
    switch (token) {
      case 'shield-check':
        return <ShieldCheck className="w-7 h-7 text-brand-primary" />;
      case 'award':
        return <Award className="w-7 h-7 text-accent-orange" />;
      case 'map-pin':
        return <MapPin className="w-7 h-7 text-brand-primary" />;
      case 'zap':
      default:
        return <Zap className="w-7 h-7 text-accent-orange" />;
    }
  };

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-start p-6 rounded-2xl bg-surface border border-slate-200/60 hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {renderIcon(item.iconToken)}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink mb-2">
                {item.label}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

