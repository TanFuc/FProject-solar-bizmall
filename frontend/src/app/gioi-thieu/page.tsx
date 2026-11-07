import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Target, Compass, Award, Check, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Kiến Tạo Tương Lai Năng Lượng Xanh | Giới Thiệu BM SOLAR',
  description:
    'Tìm hiểu về Công ty TNHH Năng Lượng BM SOLAR — Tổng thầu EPC điện mặt trời và pin lưu trữ BESS uy tín hàng đầu tại miền Trung và Nam Bộ.',
  canonicalPath: '/gioi-thieu',
  ogImage: '/images/logo.png',
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
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_gioi-thieu_desktop.png */}
      <section className="relative w-full min-h-[380px] lg:min-h-[440px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1920&q=85"
            alt="Kiến tạo tương lai năng lượng xanh"
            fill
            priority
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/95 via-[#071F3D]/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
              GIỚI THIỆU
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Kiến tạo tương lai <br />
              <span className="text-accent-orange">năng lượng xanh</span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1">
              BM SOLAR đồng hành cùng hàng ngàn khách hàng trên hành trình chuyển dịch năng lượng.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lien-he"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Nhận tư vấn ngay</span>
                <span>→</span>
              </Link>
              <a
                href="#cau-chuyen-thuong-hieu"
                className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Về chúng tôi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Giới thiệu</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: BM SOLAR — Nơi công nghiệp gặp nhu cầu thực tế */}
      <section id="cau-chuyen-thuong-hieu" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                01 / CÂU CHUYỆN THƯƠNG HIỆU
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                BM SOLAR — Nơi công nghiệp gặp nhu cầu thực tế
              </h2>
            </div>
            <Link
              href="/du-an"
              className="text-xs font-bold text-accent-orange hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem hồ sơ năng lực</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                Không chỉ cung cấp thiết bị, Chúng tôi liên kết mọi giải pháp
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Được thành lập với sứ mệnh phổ cập năng lượng sạch tại Việt Nam, BM SOLAR định vị là tổng thầu EPC chuyên sâu về kỹ thuật, tư vấn tối ưu chi phí và hỗ trợ vận hành trọn đời.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chúng tôi kết nối trực tiếp với các nhà sản xuất Tier 1 thế giới như Canadian Solar, Deye, Dyness để mang lại giải pháp an toàn cao nhất với chi phí cạnh tranh nhất.
              </p>

              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Đội ngũ kỹ sư chuyên môn cao</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Giải pháp toàn diện theo nhu cầu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Đồng hành trọn vòng đời dự án</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/lien-he"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/20 inline-flex items-center gap-2"
                >
                  <span>Tìm hiểu thêm về BM SOLAR</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="BM SOLAR Dự án thực tế"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">200+ Dự Án</p>
                  <p className="text-[11px] text-slate-500">Đã triển khai trên toàn quốc</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 02: Tầm nhìn - Sứ mệnh - Giá trị cốt lõi */}
      <section className="py-12 lg:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
              02 / TẦM NHÌN & SỨ MỆNH
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tầm nhìn - Sứ mệnh - Giá trị cốt lõi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tầm nhìn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trở thành tổng thầu EPC điện mặt trời và pin lưu trữ năng lượng hàng đầu tại Việt Nam, mang lại giải pháp công nghệ hiện đại và bền vững.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent-orange flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sứ mệnh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cung cấp giải pháp năng lượng sạch an toàn, tin cậy, tối ưu tài chính cho mọi công trình từ gia đình, doanh nghiệp đến nhà máy công nghiệp.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Giá trị cốt lõi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chất lượng chuẩn mực - Tận tâm đồng hành - Sáng tạo bền vững. Luôn đặt quyền lợi và sự an toàn lâu dài của khách hàng lên hàng đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 03: Một hệ thống — Nhiều giá trị */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
              03 / GIÁ TRỊ MANG LẠI
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Một hệ thống — Nhiều giá trị
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                alt="Tiết kiệm chi phí điện"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Tiết kiệm chi phí điện
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                alt="Bền vững & Thân thiện môi trường"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Bền vững & Thân thiện
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 block bg-slate-900 aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"
                alt="Tự chủ nguồn năng lượng"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 p-5 flex items-end justify-between z-20">
                <span className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">
                  Tự chủ nguồn năng lượng
                </span>
                <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 04: Quy trình trên nền xanh */}
      <ProcessFiveSteps
        tag="04 / NĂNG LỰC TRIỂN KHAI"
        title="Trải nghiệm rõ ràng, Quy trình minh bạch"
        rightLinkText="Xem quy trình chi tiết →"
        rightLinkHref="/giai-phap"
      />

      {/* 7. Section 05: Khám phá BM SOLAR qua hình ảnh */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
              05 / HÌNH ẢNH THỰC TẾ
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Khám phá BM SOLAR qua hình ảnh
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-slate-100 shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1400&q=80"
                alt="Trạm sạc và điện mặt trời BM SOLAR"
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Khảo sát công trình thực tế"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                  alt="Lắp đặt tấm pin mặt trời"
                  fill
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
