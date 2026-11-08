import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { VisualImage } from '@/components/ui/VisualImage';

export interface PublicBrand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
}

export function BrandStrip({ brands, headline }: { brands: PublicBrand[]; headline?: string }) {
  if (!brands.length) return null;

  return (
    <section className="solar-brand-strip w-full my-6 sm:my-8" aria-label="Thương hiệu đối tác">
      {/* Section Header */}
      <div className="solar-brand-header flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FF6B19] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B19]" />
            <span>Đối Tác Tier 1 Bloomberg</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-[#0B1E36] tracking-tight">
            {headline || 'Thương Hiệu Thiết Bị Đồng Hành'}
          </h2>
        </div>
        <Link
          href="/san-pham"
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0D4EA6] hover:text-[#FF6B19] transition-colors self-start sm:self-auto"
        >
          <span>Xem tất cả thiết bị</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Fully Responsive Grid across Mobile (2 cols), Tablet (3 cols), Desktop (6 cols) */}
      <div className="solar-brand-track grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 w-full">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/san-pham?brand=${brand.slug}`}
            className="solar-brand-card group relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 hover:border-[#0D4EA6]/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-center min-h-[54px] sm:min-h-[64px]"
            title={`Xem các sản phẩm của ${brand.name}`}
          >
            {brand.logoUrl ? (
              <VisualImage
                src={brand.logoUrl}
                alt={brand.name}
                width={120}
                height={40}
                className="max-h-7 sm:max-h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <span className="font-extrabold text-xs sm:text-[13px] md:text-sm text-[#0D2E63] group-hover:text-[#0D4EA6] transition-colors leading-tight line-clamp-1">
                {brand.name}
              </span>
            )}
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#FF6B19] uppercase tracking-wider mt-0.5 transition-colors">
              Chính Hãng
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
