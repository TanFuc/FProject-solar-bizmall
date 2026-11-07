import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCategoryItem } from '@/types/bmsolar-api';
import { ArrowUpRight } from 'lucide-react';

interface CategoryStripProps {
  categories?: ProductCategoryItem[];
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="relative z-30 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink tracking-tight">
              Danh Mục Thiết Bị Năng Lượng Chính Hãng
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Nhập khẩu trực tiếp đầy đủ CO/CQ từ các thương hiệu Tier 1 hàng đầu thế giới
            </p>
          </div>
          <Link
            href="/san-pham"
            className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <span>Xem tất cả thiết bị</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/san-pham?category=${cat.slug}`}
              className="group relative bg-surface rounded-xl p-4 sm:p-5 flex flex-col justify-between border border-slate-200/60 hover:border-brand-primary/40 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Image Preview Container */}
              <div className="relative w-full h-36 sm:h-40 rounded-lg overflow-hidden bg-slate-200 mb-4">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 text-brand-primary shadow-sm group-hover:bg-accent-orange group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-brand-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

