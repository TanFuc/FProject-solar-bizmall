import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getSolutions } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Giải Pháp Điện Mặt Trời & Pin Lưu Trữ Năng Lượng — BM SOLAR',
  description:
    'Khám phá các giải pháp điện mặt trời mái nhà hòa lưới & lưu trữ Hybrid cho hộ gia đình, doanh nghiệp, nhà xưởng quy mô từ 3kWp đến hàng MWp.',
  canonicalPath: '/giai-phap',
  ogImage: '/images/logo.png',
  keywords: [
    'giải pháp điện mặt trời',
    'điện mặt trời gia đình',
    'điện mặt trời doanh nghiệp',
    'điện mặt trời nhà xưởng',
    'điện mặt trời zero export',
    'pin lưu trữ BESS',
  ],
});

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  const standardWorkflow = [
    { step: '01', title: 'Khảo Sát Thực Tế 3D', desc: 'Đo đạc diện tích mái, hướng nắng, góc nghiêng và tải trọng kết cấu miễn phí tận nơi.' },
    { step: '02', title: 'Mô Phỏng Bức Xạ PVSyst', desc: 'Xuất bản vẽ 3D chi tiết và biểu đồ sản lượng điện dự kiến cùng bài toán tài chính hoàn vốn.' },
    { step: '03', title: 'Cung Ứng Thiết Bị Tier 1', desc: 'Nhập khẩu 100% chính hãng tấm pin Canadian Solar, biến tần Deye, pin Dyness có CO/CQ.' },
    { step: '04', title: 'Thi Công Chuẩn An Toàn', desc: 'Lắp đặt nhanh gọn 2 - 3 ngày bởi đội ngũ kỹ sư điện đạt chuẩn an toàn điện lực EVN.' },
    { step: '05', title: 'Hòa Lưới & Bảo Trì O&M', desc: 'Hoàn tất thủ tục đấu nối EVN, bàn giao app theo dõi điện thoại và bảo dưỡng định kỳ.' },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header & Breadcrumb */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Giải pháp</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Điện Mặt Trời & Lưu Trữ BESS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Giải Pháp Năng Lượng Mặt Trời Toàn Diện & Tối Ưu Chi Phí
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Thiết kế riêng biệt cho từng loại hình công trình từ biệt thự gia đình, tòa nhà kinh doanh đến nhà máy công nghiệp với cam kết hoàn vốn nhanh từ 3.5 - 4.5 năm.
          </p>
        </div>
      </section>

      {/* 2. Solutions Breakdown */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {solutions.map((sol, idx) => (
          <div
            key={sol.slug}
            id={sol.slug}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-24 ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Visual Side */}
            <div className={`lg:col-span-6 relative ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-card bg-slate-200">
                <Image
                  src={sol.heroImage}
                  alt={sol.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  Công suất: {sol.capacityRange}
                </div>
              </div>

              {/* Stat callout */}
              <div className="mt-4 grid grid-cols-2 gap-3 bg-surface p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-ink-muted">Tiết kiệm tháng:</span>
                    <p className="text-xs sm:text-sm font-bold text-ink">{sol.monthlySavings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-accent-orange shrink-0" />
                  <div>
                    <span className="text-[11px] text-ink-muted">Hoàn vốn dự kiến:</span>
                    <p className="text-xs sm:text-sm font-bold text-ink">{sol.roiYears}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className={`lg:col-span-6 space-y-5 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {sol.title}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {sol.overview}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Lợi ích nổi bật:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sol.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink font-semibold">{b.title}:</strong>{' '}
                        <span className="text-ink-muted">{b.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button variant="orange" size="md" href={`/giai-phap/${sol.slug}`}>
                  Xem Chi Tiết Cấu Hình
                </Button>
                <Link
                  href="/lien-he"
                  className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-dark flex items-center gap-1"
                >
                  <span>Tư vấn khảo sát</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Engineering Standard Workflow */}
      <section className="py-16 bg-surface border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
              Quy Trình Chuẩn Hóa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              5 Bước Triển Khai Chuyên Nghiệp Tại BM SOLAR
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Đảm bảo hệ thống đạt độ an toàn điện tối đa, thẩm mỹ cao và vận hành bền bỉ 25 năm
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {standardWorkflow.map((w, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <span className="text-3xl font-black text-brand-primary/20 group-hover:text-accent-orange/40 transition-colors">
                    {w.step}
                  </span>
                  <h3 className="text-base font-bold text-ink mt-2 mb-1">{w.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Consultation Form Block */}
      <ConsultationFormBlock
        headline="Nhận Báo Giá & Bản Vẽ Thiết Kế 3D Mái Nhà Miễn Phí"
        subheading="Điền thông tin diện tích mái để kỹ sư BM SOLAR tính toán chính xác công suất và phương án tối ưu nhất."
      />
    </div>
  );
}

