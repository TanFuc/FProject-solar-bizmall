'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ContentTrack } from '@/components/ui/ContentTrack';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/types/bmsolar-api';
import { useTranslation } from '@/lib/i18n';

export function FeaturedProducts({ products, title }: { products?: ProductCard[]; title?: string }) {
  const { t } = useTranslation();

  if (!products?.length) return null;

  return (
    <section className="solar-products" id="san-pham">
      <div className="solar-section-heading">
        <div>
          <p>{t('products.badge')}</p>
          <h2>{title || t('products.title')}</h2>
        </div>
        <Link href="/san-pham" className="group flex items-center gap-1.5 transition-colors">
          <span>{t('products.viewAll')}</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ContentTrack className="solar-product-grid" label={title || t('products.title')}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/san-pham/${product.slug}`}
            className="solar-product-card group"
            draggable={false}
          >
            <div className="solar-product-photo">
              {product.coverMediaUrl && (
                <Image
                  src={product.coverMediaUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width:767px) 184px, (max-width:1023px) 33vw, 25vw"
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                  draggable={false}
                />
              )}
            </div>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>
            <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </ContentTrack>
    </section>
  );
}
