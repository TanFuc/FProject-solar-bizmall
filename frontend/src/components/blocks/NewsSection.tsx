import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleItem } from '@/types/bmsolar-api';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';

interface NewsSectionProps {
  articles?: ArticleItem[];
}

export function NewsSection({ articles }: NewsSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-surface" id="tin-tuc">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
              Kiến Thức & Thị Trường
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
              Cẩm Nang Năng Lượng & Chính Sách Mới Nhất
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Cập nhật thông tư, quy định giá điện và cẩm nang lựa chọn thiết bị điện mặt trời từ chuyên gia BM SOLAR.
            </p>
          </div>
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <span>Xem tất cả bài viết</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/tin-tuc/${art.slug}`}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {art.coverMediaUrl && (
                    <Image
                      src={art.coverMediaUrl}
                      alt={art.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {art.category && (
                    <span className="absolute top-3 left-3 bg-brand-primary/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {art.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {art.publishedAt
                    ? new Date(art.publishedAt).toLocaleDateString('vi-VN')
                    : 'Mới cập nhật'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTimeMinutes || 5} phút đọc
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

