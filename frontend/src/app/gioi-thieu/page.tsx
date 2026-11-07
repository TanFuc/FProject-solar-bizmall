import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Target, Compass, Award, Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Kiến Tạo Tương Lai Năng Lượng Xanh | Giới Thiệu BM SOLAR',
  description:
    'Tìm hiểu về Công ty TNHH Năng Lượng BM SOLAR — Tổng thầu EPC điện mặt trời và pin lưu trữ BESS uy tín hàng đầu tại miền Trung và Nam Bộ.',
  canonicalPath: '/gioi-thieu',
  ogImage: '/images/designs/hero-gioi-thieu.png',
  keywords: [
    'giới thiệu BM Solar',
    'công ty năng lượng BM Solar',
    'tổng thầu EPC điện mặt trời',
    'điện mặt trời Quy Nhơn',
    'điện mặt trời TP.HCM',
  ],
});

export default function AboutPage() {
  return (
    <div className="solar-page solar-page-gioi-thieu w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_gioi-thieu_desktop.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-gioi-thieu.png"
            alt="Kiến tạo tương lai năng lượng xanh"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              GIỚI THIỆU
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Kiến tạo tương lai <br />
              <span className="text-[#FF6B19]">năng lượng xanh</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              BM SOLAR đồng hành cùng hàng ngàn hộ gia đình và doanh nghiệp Việt Nam trên hành trình chuyển dịch xanh.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận tư vấn miễn phí</span>
                <span>→</span>
              </Link>
              <a
                href="#cau-chuyen-thuong-hieu"
                className="px-5 py-2.5 sm:py-3 rounded-full border border-white/40 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Về chúng tôi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="bg-[#F8FAFC] border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">Giới thiệu</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: BM SOLAR — Nơi công nghệ gặp nhu cầu thực tế */}
      <section id="cau-chuyen-thuong-hieu" className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                01 / VỀ CHÚNG TÔI
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                BM SOLAR — Nơi công nghệ gặp nhu cầu thực tế
              </h2>
            </div>
            <Link
              href="/du-an"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Khám phá hệ sinh thái</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider">
                TỪ Ý TƯỞNG ĐẾN GIẢI PHÁP TOÀN DIỆN
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                Không chỉ cung cấp thiết bị, Chúng tôi gắn kết với giải pháp
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Được thành lập với sứ mệnh mang đến giải pháp năng lượng sạch bền vững, BM SOLAR không ngừng đổi mới công nghệ và chuẩn hóa quy trình triển khai.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chúng tôi tin rằng tương lai năng lượng nằm ở sự kết hợp hoàn hảo giữa công nghệ hiện đại và nhu cầu thực tế của từng khách hàng.
              </p>

              <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Từ hợp tác nông nghiệp đến mái nhà</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giải pháp toàn diện trọn gói</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B19] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Đội ngũ kỹ sư chuyên môn cao</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-6 py-2.5 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#FF6B19]/20 transition-all"
                >
                  <span>Tìm hiểu thêm về chúng tôi</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-[600/400] bg-slate-100 shadow-md">
              <Image
                src="/images/designs/gioi-thieu-story.png"
                alt="BM SOLAR Dự án thực tế"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">200+ Dự Án</p>
                  <p className="text-[11px] text-slate-500">Đã hoàn thành toàn diện</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FF6B19] text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Tầm nhìn • Sứ mệnh • Giá trị cốt lõi */}
      <section className="py-10 lg:py-14 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                02 / GIÁ TRỊ CỐT LÕI
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tầm nhìn • Sứ mệnh • Giá trị cốt lõi
              </h2>
            </div>
            <a
              href="#tuyen-ngon"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem tuyên ngôn</span>
              <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3A78] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
                01 / TẦM NHÌN
              </span>
              <h3 className="text-base font-bold text-slate-900">Tầm nhìn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trở thành đơn vị tiên phong dẫn đầu giải pháp năng lượng thông minh tại Việt Nam, mang công nghệ hiện đại phục vụ cuộc sống.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B19] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
                02 / SỨ MỆNH
              </span>
              <h3 className="text-base font-bold text-slate-900">Sứ mệnh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mang năng lượng xanh đến mọi mái nhà và doanh nghiệp với chi phí hợp lý, thi công chuẩn mực và hiệu quả dài hạn.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
                03 / GIÁ TRỊ CỐT LÕI
              </span>
              <h3 className="text-base font-bold text-slate-900">Giá trị cốt lõi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chất lượng là nền tảng, Đổi mới là động lực, Khách hàng là trung tâm. Cam kết đồng hành an tâm trọn vòng đời công trình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Một hệ thống — Nhiều giá trị (3 Cards matching BM_SOLAR_gioi-thieu_desktop.png) */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                03 / NĂNG LỰC TRIỂN KHAI
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Một hệ thống — Nhiều giá trị
              </h2>
            </div>
            <Link
              href="/giai-phap"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem tất cả giải pháp</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Link
              href="/giai-phap"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                src="/images/designs/gioi-thieu-card-1.png"
                alt="Tiết kiệm chi phí điện"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Tiết kiệm chi phí điện</span>
            </Link>

            <Link
              href="/giai-phap"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                src="/images/designs/gioi-thieu-card-2.png"
                alt="Bền vững & Thân thiện môi trường"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Bền vững & Thân thiện</span>
            </Link>

            <Link
              href="/giai-phap"
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[408/260]"
            >
              <Image
                src="/images/designs/gioi-thieu-card-3.png"
                alt="Tự chủ nguồn năng lượng"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="sr-only">Tự chủ nguồn năng lượng</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Section 04: Trải nghiệm rõ ràng. Quy trình minh bạch. */}
      <ProcessFiveSteps
        tag="04 / QUY TRÌNH LÀM VIỆC"
        title="Trải nghiệm rõ ràng. Quy trình minh bạch."
        rightLinkText="Tìm hiểu quy trình →"
        rightLinkHref="/giai-phap"
      />

      {/* 7. Section 05: Khám phá BM SOLAR qua hình ảnh */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider mb-1">
                05 / HÌNH ẢNH THỰC TẾ
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Khám phá BM SOLAR qua hình ảnh
              </h2>
            </div>
            <Link
              href="/du-an"
              className="text-xs font-bold text-[#FF6B19] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem thêm thư viện</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[1260/320] bg-slate-100 shadow-xs">
              <Image
                src="/images/designs/gioi-thieu-gallery-top.png"
                alt="Showroom và Trạm sạc BM SOLAR"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[615/300] bg-slate-100 shadow-xs">
                <Image
                  src="/images/designs/gioi-thieu-gallery-bottom-1.png"
                  alt="Dự án hộ gia đình"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[615/300] bg-slate-100 shadow-xs">
                <Image
                  src="/images/designs/gioi-thieu-gallery-bottom-2.png"
                  alt="Dự án nhà xưởng công nghiệp"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
