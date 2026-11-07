'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeaturedProductsProps {
  products?: ProductCard[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { openConsultationModal } = useBranch();
  const { t, isEnglish } = useTranslation();

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-surface" id="san-pham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
              {t('products.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
              {t('products.title')}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {t('products.subtitle')}
            </p>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <span>{t('products.viewAll')}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Image */}
                <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                  {prod.coverMediaUrl && (
                    <Image
                      src={prod.coverMediaUrl}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {prod.tier && (
                    <span className="absolute top-3 left-3 bg-brand-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {prod.tier}
                    </span>
                  )}
                  {prod.warrantyYears && (
                    <span className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> {prod.warrantyYears} {isEnglish ? 'Yrs' : 'Năm'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="font-semibold text-brand-primary">
                      {prod.category?.name || (isEnglish ? 'Equipment' : 'Thiết bị')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {prod.sku}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-ink line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {prod.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer / CTA */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-slate-500">
                    {isEnglish ? 'Est. Price:' : 'Giá tham khảo:'}
                  </span>
                  <span className="text-xs font-bold text-accent-orange">
                    {prod.priceEstimate || (isEnglish ? 'Contact for Quote' : 'Liên hệ báo giá')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/san-pham/${prod.slug}`}
                    className="py-2 px-3 text-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {t('products.viewDetails')}
                  </Link>
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={() => openConsultationModal(`Hỏi giá sản phẩm: ${prod.name} (${prod.sku})`)}
                  >
                    {t('products.requestQuote')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

