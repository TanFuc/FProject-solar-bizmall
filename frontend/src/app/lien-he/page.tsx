import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { getSiteShell, getFaqs } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';

export const metadata: Metadata = constructMetadata({
  title: 'Liên Hệ & Mạng Lưới Chi Nhánh BM SOLAR — Quy Nhơn & TP.HCM',
  description:
    'Thông tin liên hệ, hotline, địa chỉ văn phòng và hỗ trợ kỹ thuật 24/7 của BM SOLAR tại TP. Quy Nhơn (Bình Định) và TP. Hồ Chí Minh.',
  canonicalPath: '/lien-he',
  ogImage: '/images/logo.png',
  keywords: [
    'liên hệ BM Solar',
    'hotline BM Solar',
    'địa chỉ BM Solar Quy Nhơn',
    'địa chỉ BM Solar TP.HCM',
  ],
});

export default async function ContactPage() {
  const siteShell = await getSiteShell();
  const branches = siteShell.utilityBar.branches;
  const faqs = await getFaqs();

  const hqSchema = getLocalBusinessSchema('quynhon');
  const hcmSchema = getLocalBusinessSchema('tphcm');
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Liên hệ', url: '/lien-he' },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[hqSchema, hcmSchema, breadcrumbSchema]} />
      {/* 1. Header */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/95 to-brand-primary/50 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Liên hệ</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hỗ Trợ Khách Hàng 24/7</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Liên Hệ Với BM SOLAR
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Hệ thống chi nhánh và đội ngũ kỹ sư sẵn sàng hỗ trợ khảo sát, tư vấn giải pháp và báo giá miễn phí trong vòng 15 phút.
          </p>
        </div>
      </section>

      {/* 2. Branch Cards Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
            Mạng Lưới Hoạt Động
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Văn Phòng & Trung Tâm Kỹ Thuật
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((b) => {
            const phoneChannel = b.channels.find((c) => c.type === 'phone');
            const zaloChannel = b.channels.find((c) => c.type === 'zalo');

            return (
              <div
                key={b.id}
                className="bg-surface rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-6 group hover:shadow-card-hover transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-light text-brand-primary">
                      {b.code === 'QN-HQ' ? 'Trụ Sở Chính' : 'Chi Nhánh Phía Nam'}
                    </span>
                    <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Đang hoạt động
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-ink group-hover:text-brand-primary transition-colors">
                    {b.name}
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm text-ink-muted">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-ink">{b.streetAddress}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Thứ 2 - Thứ 7: 07:30 - 17:30 (Trực hotline 24/7)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>kinhdoanh@bmsolar.vn</span>
                    </div>
                  </div>
                </div>

                {/* Branch Direct Actions */}
                <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 gap-3">
                  {phoneChannel && (
                    <a
                      href={phoneChannel.actionUrl || `tel:${phoneChannel.target}`}
                      className="py-3 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-brand-primary hover:bg-brand-light flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Phone className="w-4 h-4 text-accent-orange" />
                      <span>{phoneChannel.formatted || phoneChannel.target}</span>
                    </a>
                  )}

                  {zaloChannel && (
                    <a
                      href={zaloChannel.actionUrl || `https://zalo.me/${zaloChannel.target}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Nhắn Zalo OA</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Frequently Asked Questions (FAQs) */}
      <section className="py-16 bg-surface border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Hỏi Đáp Kỹ Thuật
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Câu Hỏi Thường Gặp Về Điện Mặt Trời
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Giải đáp thắc mắc phổ biến về thủ tục pháp lý, hoàn vốn và kỹ thuật
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2"
              >
                <h3 className="text-base font-bold text-ink flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Consultation Form */}
      <ConsultationFormBlock
        headline="Gửi Yêu Cầu Tư Vấn & Khảo Sát Mái Nhà"
        subheading="Điền thông tin liên hệ, kỹ sư BM SOLAR phụ trách khu vực của bạn sẽ gọi lại tư vấn ngay."
      />
    </div>
  );
}

