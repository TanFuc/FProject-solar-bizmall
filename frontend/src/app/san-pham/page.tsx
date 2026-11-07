import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getProducts } from '@/lib/api/client';
import { fallbackCategories } from '@/lib/api/mockData';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { ShieldCheck, Zap, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Danh Mục Thiết Bị Năng Lượng Mặt Trời Chính Hãng — BM SOLAR',
  description:
    'Phân phối thiết bị điện mặt trời Tier 1: Biến tần Deye, Huawei, Tấm pin Canadian Solar, Jinko 550W+, Pin lưu trữ Dyness BESS và trạm sạc EV.',
  canonicalPath: '/san-pham',
  ogImage: '/images/logo.png',
  keywords: [
    'thiết bị điện mặt trời',
    'inverter deye chính hãng',
    'tấm pin canadian solar',
    'pin lưu trữ lithium dyness',
    'bán inverter hòa lưới',
  ],
});

interface ProductsPageProps {
  searchParams?: {
    category?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const currentCategorySlug = searchParams?.category;
  const productsResponse = await getProducts();

  let products = productsResponse.data;
  if (currentCategorySlug) {
    if (currentCategorySlug === 'tam-pin') {
      products = products.filter((p) => p.category?.slug.includes('tam-pin'));
    } else if (currentCategorySlug === 'inverter') {
      products = products.filter((p) => p.category?.slug.includes('inverter') || p.category?.slug.includes('bien-tan'));
    } else if (currentCategorySlug === 'pin-luu-tru') {
      products = products.filter((p) => p.category?.slug.includes('pin-luu-tru') || p.category?.slug.includes('bess'));
    } else if (currentCategorySlug === 'tram-sac-ev') {
      products = products.filter((p) => p.category?.slug.includes('tram-sac-ev') || p.category?.slug.includes('ev'));
    }
  }

  const categoryTabs = [
    { label: 'Tất cả thiết bị', slug: '' },
    { label: 'Tấm Pin Năng Lượng', slug: 'tam-pin' },
    { label: 'Biến Tần Inverter', slug: 'inverter' },
    { label: 'Pin Lưu Trữ BESS', slug: 'pin-luu-tru' },
    { label: 'Trạm Sạc Xe Điện', slug: 'tram-sac-ev' },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Page Header */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Sản phẩm</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phân Phối Chính Hãng 100%</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Thiết Bị Điện Mặt Trời & Lưu Trữ Năng Lượng Tier 1
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Cam kết đầy đủ chứng nhận CO/CQ từ các tập đoàn hàng đầu thế giới. Bảo hành chính hãng nhà sản xuất, hỗ trợ kỹ thuật trọn đời và linh kiện sẵn có tại kho Quy Nhơn & TP.HCM.
          </p>
        </div>
      </section>

      {/* 2. Interactive Filter Bar */}
      <section className="sticky top-20 z-30 bg-surface border-b border-slate-200/80 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-ink-muted flex items-center gap-1.5 mr-2 hidden sm:flex">
              <Filter className="w-3.5 h-3.5" /> Phân loại:
            </span>
            {categoryTabs.map((tab) => {
              const isActive =
                (!currentCategorySlug && tab.slug === '') ||
                currentCategorySlug === tab.slug;

              return (
                <Link
                  key={tab.slug}
                  href={tab.slug ? `/san-pham?category=${tab.slug}` : '/san-pham'}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white text-ink-muted hover:text-ink hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <span className="text-xs text-ink-muted shrink-0 hidden md:block">
            Hiển thị <strong>{products.length}</strong> thiết bị
          </span>
        </div>
      </section>

      {/* 3. Product Cards Grid */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-sm text-ink-muted">Chưa có sản phẩm nào trong danh mục này.</p>
            <Button variant="orange" size="md" href="/san-pham">
              Xem Tất Cả Sản Phẩm
            </Button>
          </div>
        ) : (
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
                        <ShieldCheck className="w-3 h-3" /> {prod.warrantyYears} Năm
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                      <span className="font-semibold text-brand-primary">
                        {prod.category?.name || 'Thiết bị'}
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

                {/* Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-xs text-slate-500">Giá tham khảo:</span>
                    <span className="text-xs font-bold text-accent-orange">
                      {prod.priceEstimate || 'Liên hệ báo giá'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/san-pham/${prod.slug}`}
                      className="py-2 px-3 text-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Chi tiết
                    </Link>
                    <Button
                      variant="orange"
                      size="sm"
                      href={`/san-pham/${prod.slug}#tu-van`}
                    >
                      Báo Giá
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Consultation Form Block */}
      <ConsultationFormBlock
        headline="Yêu Cầu Báo Giá Thiết Bị Số Lượng Lớn Cho Đại Lý & Dự Án"
        subheading="BM SOLAR áp dụng chính sách chiết khấu đại lý tốt nhất cùng hỗ trợ kỹ thuật cài đặt tận nơi."
      />
    </div>
  );
}

