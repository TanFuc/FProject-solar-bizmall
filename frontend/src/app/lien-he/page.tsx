import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, HelpCircle } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Liên Hệ Hợp Tác — Mạng Lưới Chi Nhánh | BM SOLAR',
  description:
    'Thông tin liên hệ, hotline, địa chỉ trụ sở Quy Nhơn và chi nhánh Gò Vấp - TP.HCM của BM SOLAR. Đội ngũ kỹ sư hỗ trợ khảo sát 3D và báo giá miễn phí 24/7.',
  canonicalPath: '/lien-he',
  ogImage: '/images/logo.png',
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
      phone: '0932 456 789',
      phoneRaw: '0932456789',
      email: 'quynhon@bmsolar.vn',
      hours: 'Thứ 2 - Thứ 7: 07:30 - 17:30 (Trực hotline 24/7)',
      mapUrl: 'https://maps.google.com/?q=01+Le+Duan+Quy+Nhon',
    },
    {
      id: 'br_hcm',
      title: 'Chi nhánh TP.HCM — Quận Gò Vấp',
      address: '568 Quang Trung, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh',
      phone: '0909 888 999',
      phoneRaw: '0909888999',
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
      a: 'BM SOLAR cam kết 100% thiết bị chính hãng Tier 1 Bloomberg: Tấm pin bảo hành vật lý 12 năm và bảo hành hiệu suất 25 năm (hiệu suất sau 25 năm vẫn đạt trên 80%). Biến tần Inverter bảo hành 5 năm (có thể gia hạn 10 năm), pin lưu trữ Lithium bảo hành 10 năm.',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[hqSchema, hcmSchema, breadcrumbSchema]} />

      {/* 1. Hero Section matching BM_SOLAR_lien-he_desktop.png */}
      <section className="relative w-full min-h-[380px] lg:min-h-[440px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=85"
            alt="Liên hệ BM SOLAR"
            fill
            priority
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/95 via-[#071F3D]/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
              LIÊN HỆ
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Kết nối hợp tác <br />
              <span className="text-accent-orange">Đồng hành cùng BM SOLAR</span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1">
              Đội ngũ kỹ sư năng lượng sẵn sàng tư vấn, khảo sát 3D và báo giá chi tiết trong vòng 24 giờ.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="tel:1900026689"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Gọi hotline: 1900 026 689</span>
                <span>→</span>
              </a>
              <a
                href="#form-bao-gia"
                className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Đăng ký tư vấn trực tuyến
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
            <span className="text-slate-800">Liên hệ</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Mạng lưới chi nhánh (2 Cards) */}
      <section id="chi-nhanh" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
              01 / MẠNG LƯỚI CHI NHÁNH
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trụ sở chính & Văn phòng đại diện
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-brand-primary hover:shadow-lg transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-orange animate-ping" />
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {b.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    <p className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{b.address}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-accent-orange shrink-0" />
                      <a href={`tel:${b.phoneRaw}`} className="font-bold text-brand-primary hover:underline">
                        {b.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-accent-orange shrink-0" />
                      <span>{b.email}</span>
                    </p>
                    <p className="flex items-center gap-2.5 text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{b.hours}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${b.phoneRaw}`}
                    className="px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-navy text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi điện</span>
                  </a>
                  <a
                    href={`https://zalo.me/${b.phoneRaw}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Zalo Chat</span>
                  </a>
                  <a
                    href={b.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Chỉ đường Maps</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section 02: Form tư vấn & Khảo sát 3D */}
      <section id="form-bao-gia">
        <ConsultationFormBlock />
      </section>

      {/* 5. Section 03: Câu hỏi thường gặp (FAQs) */}
      <section className="py-12 lg:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider">
              03 / HỎI ĐÁP & CHÍNH SÁCH
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Câu hỏi thường gặp về điện mặt trời
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Những giải đáp chi tiết từ chuyên gia kỹ thuật BM SOLAR giúp quý khách an tâm đầu tư.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-orange/15 text-accent-orange flex items-center justify-center shrink-0 text-xs mt-0.5">
                    ?
                  </span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Section 04: Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
