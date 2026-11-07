import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, HelpCircle } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Liên Hệ Hợp Tác — Mạng Lưới Chi Nhánh | BM SOLAR',
  description:
    'Thông tin liên hệ, hotline, địa chỉ trụ sở Quy Nhơn và chi nhánh Gò Vấp - TP.HCM của BM SOLAR. Đội ngũ kỹ sư hỗ trợ khảo sát 3D và báo giá miễn phí 24/7.',
  canonicalPath: '/lien-he',
  ogImage: '/images/designs/hero-lien-he.png',
  keywords: [
    'liên hệ BM Solar',
    'hotline BM Solar',
    'địa chỉ BM Solar Quy Nhơn',
    'địa chỉ BM Solar TP.HCM',
    'báo giá điện mặt trời áp mái',
  ],
});

export default function ContactPage() {
  const hqSchema = getLocalBusinessSchema('quynhon');
  const hcmSchema = getLocalBusinessSchema('tphcm');
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Liên hệ', url: '/lien-he' },
  ]);

  const branches = [
    {
      id: 'br_qn',
      title: 'Trụ sở chính — TP. Quy Nhơn',
      address: '01 Lê Duẩn, Phường Lý Thường Kiệt, TP. Quy Nhơn, Tỉnh Bình Định',
      phone: '1900 026 689',
      phoneRaw: '1900026689',
      email: 'quynhon@bmsolar.vn',
      hours: 'Thứ 2 - Thứ 7: 07:30 - 17:30 (Trực hotline 24/7)',
      mapUrl: 'https://maps.google.com/?q=01+Le+Duan+Quy+Nhon',
    },
    {
      id: 'br_hcm',
      title: 'Chi nhánh TP.HCM — Quận Gò Vấp',
      address: '568 Quang Trung, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh',
      phone: '1900 026 689',
      phoneRaw: '1900026689',
      email: 'tphcm@bmsolar.vn',
      hours: 'Thứ 2 - Thứ 7: 08:00 - 18:00 (Trực hotline 24/7)',
      mapUrl: 'https://maps.google.com/?q=568+Quang+Trung+Go+Vap+TPHCM',
    },
  ];

  const faqs = [
    {
      q: 'Lắp điện mặt trời hòa lưới áp mái sau bao lâu thì hoàn vốn?',
      a: 'Với biểu giá điện sinh hoạt bậc thang và giá điện kinh doanh hiện nay, thời gian hoàn vốn trung bình cho hộ gia đình là từ 3.5 đến 4.5 năm. Đối với nhà xưởng công nghiệp quy mô lớn, thời gian hoàn vốn có thể rút ngắn xuống 3 đến 3.8 năm.',
    },
    {
      q: 'Hệ thống Zero-Export (hòa lưới bám tải) hoạt động như thế nào?',
      a: 'Thiết bị biến tần Inverter kết hợp Smart Meter sẽ tự động đo đạc lượng điện tiêu thụ tức thời của các thiết bị trong nhà và điều chỉnh sản lượng từ giàn pin mặt trời đúng bằng nhu cầu, đảm bảo không phát ngược lượng điện thừa lên lưới điện EVN.',
    },
    {
      q: 'Khi trời mưa hoặc ban đêm thì nhà tôi dùng điện như thế nào?',
      a: 'Hệ thống hòa lưới sẽ tự động chuyển tiếp lấy điện lưới quốc gia EVN bù vào mà không gây chập chờn hay gián đoạn thiết bị. Nếu quý khách lắp thêm hệ thống lưu trữ pin Lithium BESS, điện tích trữ vào ban ngày sẽ tự động xả ra cấp nguồn cho phụ tải vào ban đêm.',
    },
    {
      q: 'Chính sách bảo hành thiết bị của BM SOLAR ra sao?',
      a: 'BM SOLAR cam kết 100% thiết bị chính hãng Tier 1 Bloomberg: Tấm pin bảo hành vật lý 12 năm và bảo hành hiệu suất 25 năm. Biến tần Inverter bảo hành 5 năm, pin lưu trữ Lithium bảo hành 10 năm.',
    },
  ];

  return (
    <div className="solar-page solar-page-lien-he w-full flex flex-col bg-white">
      <JsonLd data={[hqSchema, hcmSchema, breadcrumbSchema]} />

      {/* 1. Hero Section matching BM_SOLAR_lien-he_desktop.png */}
      <section className="solar-page-hero relative w-full min-h-[380px] lg:min-h-[420px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/designs/hero-lien-he.png"
            alt="Liên hệ BM SOLAR"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/90 via-[#071F3D]/60 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">
              LIÊN HỆ & TƯ VẤN
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Kết nối cùng BM SOLAR <br />
              <span className="text-[#FF6B19]">Khởi đầu năng lượng xanh</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed pt-1">
              Đội ngũ kỹ sư BM SOLAR sẵn sàng tư vấn cấu hình, khảo sát mặt bằng và gửi báo giá chi tiết hoàn toàn miễn phí.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#form-tu-van"
                className="px-6 py-2.5 sm:py-3 rounded-full bg-[#FF6B19] hover:bg-[#ea5d0f] text-white text-xs font-bold shadow-md shadow-[#FF6B19]/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Gửi yêu cầu tư vấn</span>
                <span>→</span>
              </a>
              <a
                href="tel:1900026689"
                className="px-5 py-2.5 sm:py-3 rounded-full border border-white/40 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Hotline: 1900 026 689
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
            <span className="text-slate-800 font-semibold">Liên hệ</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Form & Chi nhánh */}
      <section id="form-tu-van" className="py-10 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#FBFDFF] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
                  01 / ĐĂNG KÝ KHẢO SÁT
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Nhận báo giá & Khảo sát 3D miễn phí
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Điền thông tin bên dưới, kỹ sư BM SOLAR sẽ liên hệ lại trong vòng 15 phút làm việc.
                </p>
              </div>

              <ConsultationFormBlock source="Trang Liên Hệ" />
            </div>

            {/* Branches Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
                  02 / MẠNG LƯỚI CHI NHÁNH
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Hệ thống văn phòng BM SOLAR
                </h2>
              </div>

              <div className="space-y-4">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0B3A78] hover:shadow-md transition-all space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>{b.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0B3A78] font-bold">
                        Đang mở cửa
                      </span>
                    </h3>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#FF6B19] shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <a href={`tel:${b.phoneRaw}`} className="font-semibold text-slate-800 hover:text-[#0B3A78]">
                          {b.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{b.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{b.hours}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`tel:${b.phoneRaw}`}
                        className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-orange-50 text-[#FF6B19] hover:bg-[#FF6B19] hover:text-white transition-colors"
                      >
                        Gọi điện
                      </a>
                      <a
                        href={b.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <span>Chỉ đường</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQs Section */}
      <section className="py-10 lg:py-14 bg-[#F8FAFC] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#FF6B19] uppercase tracking-wider block">
              CÂU HỎI THƯỜNG GẶP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Giải đáp thắc mắc về điện mặt trời
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#FF6B19] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Process Steps */}
      <ProcessFiveSteps
        tag="03 / TIẾP NHẬN & XỬ LÝ"
        title="Quy trình hỗ trợ khách hàng nhanh chóng"
        rightLinkText="Xem năng lực →"
        rightLinkHref="/gioi-thieu"
      />

      {/* 6. Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
