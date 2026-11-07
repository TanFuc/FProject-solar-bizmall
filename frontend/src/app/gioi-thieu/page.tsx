import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  ShieldCheck,
  Award,
  Zap,
  MapPin,
  CheckCircle2,
  Users,
  Target,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Giới Thiệu BM SOLAR — Tổng Thầu EPC Điện Mặt Trời Uy Tín',
  description:
    'Tìm hiểu về Công ty TNHH Năng Lượng BM SOLAR, tầm nhìn trở thành tổng thầu EPC điện mặt trời và pin lưu trữ năng lượng hàng đầu tại miền Trung và Nam Bộ.',
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
  const milestones = [
    { year: '2019', title: 'Khởi đầu sứ mệnh', desc: 'Thành lập đội ngũ kỹ sư năng lượng tại TP. Quy Nhơn, Bình Định, thực hiện các dự án mái nhà gia đình đầu tiên.' },
    { year: '2021', title: 'Mở rộng thị trường', desc: 'Thành lập chi nhánh TP. Hồ Chí Minh tại Quận Gò Vấp, cán mốc 5MWp công suất lắp đặt tổng hòa lưới.' },
    { year: '2023', title: 'Đối tác chiến lược Tier 1', desc: 'Ký thỏa thuận phân phối trực tiếp với Canadian Solar, Deye Energy và Dyness Lithium Battery.' },
    { year: '2026', title: 'Tiên phong lưu trữ BESS', desc: 'Trở thành đơn vị tiên phong cung cấp giải pháp Zero-Export và hệ thống lưu trữ năng lượng BESS công nghiệp tại Việt Nam.' },
  ];

  const partners = [
    { name: 'Canadian Solar', role: 'Top 1 Tấm Pin Quang Điện Toàn Cầu' },
    { name: 'Deye Energy', role: 'Thương Hiệu Inverter Hybrid Số 1 Thế Giới' },
    { name: 'Huawei FusionSolar', role: 'Giải Pháp Biến Tần Doanh Nghiệp Thông Minh' },
    { name: 'Dyness Battery', role: 'Pin Lưu Trữ Lithium LiFePO4 Chuẩn An Toàn' },
    { name: 'Schneider Electric', role: 'Thiết Bị Đóng Cắt Chuẩn Quốc Tế' },
    { name: 'Jinko Solar', role: 'Tấm Pin N-Type TOPCon Hiệu Suất Cao' },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Page Header & Breadcrumb */}
      <section className="bg-brand-darker text-white py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-darker via-brand-dark/90 to-brand-primary/40 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Giới thiệu</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-orange text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Về Chúng Tôi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            Tiên Phong Kiến Tạo Nguồn Năng Lượng Xanh Bền Vững
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            BM SOLAR tự hào là tổng thầu EPC chuyên nghiệp cung cấp trọn gói giải pháp điện mặt trời mái nhà, hệ thống lưu trữ pin Lithium BESS và trạm sạc xe điện thông minh hàng đầu tại Việt Nam.
          </p>
        </div>
      </section>

      {/* 2. Brand Positioning & Overview */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
              Câu Chuyện BM SOLAR
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-snug">
              Kiến Thức Chuyên Sâu, Trách Nhiệm Trọn Đời Cho Từng Mái Nhà
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Được thành lập với sứ mệnh mang nguồn năng lượng sạch, độc lập và tiết kiệm đến từng hộ gia đình và doanh nghiệp Việt Nam, BM SOLAR tập hợp đội ngũ kỹ sư điện, kết cấu và tự động hóa giàu kinh nghiệm.
            </p>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Chúng tôi không chỉ bán thiết bị — chúng tôi cung cấp giải pháp tài chính năng lượng tối ưu, từ khảo sát mô phỏng 3D góc nghiêng bức xạ, lựa chọn cấu hình chuẩn Tier 1, đến thi công an toàn tuyệt đối và bảo hành hiệu suất suốt 25 năm.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-brand-primary">15+ MWp</span>
                <p className="text-xs text-ink-muted">Tổng công suất đã hòa lưới</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-accent-orange">1,200+</span>
                <p className="text-xs text-ink-muted">Khách hàng tin tưởng sử dụng</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85"
                alt="Đội ngũ kỹ sư BM SOLAR"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-brand-dark text-white p-5 rounded-xl shadow-xl hidden sm:block max-w-xs border border-white/10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-accent-orange shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Chuẩn Thiết Kế 3D</p>
                  <p className="text-[11px] text-white/70">Mô phỏng bức xạ mặt trời PVSyst trước khi thi công</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision, Mission & Core Values */}
      <section className="py-16 bg-surface border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Tầm Nhìn & Giá Trị Cốt Lõi
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Kim chỉ nam dẫn lối mọi hoạt động nghiên cứu, cung ứng và thi công của BM SOLAR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Tầm Nhìn Chiến Lược</h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Trở thành biểu tượng uy tín hàng đầu trong lĩnh vực tổng thầu EPC điện mặt trời và hệ sinh thái lưu trữ năng lượng BESS thông minh tại miền Trung và Nam Bộ.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent-light text-accent-orange flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Sứ Mệnh Phát Triển</h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Giúp khách hàng làm chủ năng lượng sạch với chi phí tối ưu nhất, vận hành an toàn và đóng góp thiết thực vào mục tiêu Net-Zero giảm phát thải của quốc gia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Cam Kết Trọn Đời</h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Đồng hành cùng khách hàng trong suốt vòng đời dự án hơn 25 năm, chính sách bảo dưỡng định kỳ miễn phí và xử lý sự cố kỹ thuật trong vòng 24 giờ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Milestones */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">Hành Trình Bền Bỉ</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Chặng Đường Phát Triển
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-brand-primary space-y-2">
              <span className="text-2xl font-black text-brand-primary">{m.year}</span>
              <h4 className="text-base font-bold text-ink">{m.title}</h4>
              <p className="text-xs text-ink-muted leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Strategic Partners */}
      <section className="py-16 bg-brand-darker text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">Hệ Sinh Thái</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Đối Tác Công Nghệ Tier 1 Hàng Đầu
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              BM SOLAR hợp tác trực tiếp với các nhà sản xuất năng lượng mặt trời hàng đầu thế giới để đảm bảo quyền lợi bảo hành cao nhất cho khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors space-y-1"
              >
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-orange" />
                  {p.name}
                </h4>
                <p className="text-xs text-white/60 pl-6">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lead Form Block */}
      <ConsultationFormBlock
        headline="Khởi Đầu Hành Trình Tiết Kiệm Năng Lượng Cùng BM SOLAR"
        subheading="Liên hệ với đội ngũ kỹ sư tại Quy Nhơn hoặc TP.HCM để được khảo sát 3D miễn phí ngay hôm nay."
      />
    </div>
  );
}

