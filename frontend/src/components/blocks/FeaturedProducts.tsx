'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/types/bmsolar-api';
import { useTranslation } from '@/lib/i18n';
export function FeaturedProducts({ products, title }: { products?: ProductCard[]; title?:string }) {
  const { t } = useTranslation();
  if (!products?.length) return null;
  return <section className="solar-products" id="san-pham">
    <div className="solar-section-heading"><div><p>{t('products.badge')}</p><h2>{title || t('products.title')}</h2></div><Link href="/san-pham">{t('products.viewAll')} <ArrowRight size={16} /></Link></div>
    <div className="solar-product-grid">{products.map(product => <Link key={product.id} href={`/san-pham/${product.slug}`} className="solar-product-card">
      <div className="solar-product-photo">{product.coverMediaUrl && <Image src={product.coverMediaUrl} alt={product.name} fill sizes="(max-width:640px) 42vw, 20vw" className="object-contain" />}</div>
      <h3>{product.name}</h3><p>{product.summary}</p><ArrowRight size={17} aria-hidden="true" />
    </Link>)}</div>
  </section>;
}
