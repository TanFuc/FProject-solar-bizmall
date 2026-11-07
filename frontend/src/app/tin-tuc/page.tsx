import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ProcessFiveSteps } from '@/components/blocks/ProcessFiveSteps';
import { JourneyCtaBanner } from '@/components/blocks/JourneyCtaBanner';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Tin Tức & Cẩm Nang Chuyển Dịch Năng Lượng | BM SOLAR',
  description:
    'Cập nhật chính sách mua bán điện trực tiếp DPPA, cẩm nang kỹ thuật điện mặt trời áp mái và xu hướng công nghệ pin lưu trữ BESS tại Việt Nam.',
  canonicalPath: '/tin-tuc',
  ogImage: '/images/logo.png',
  keywords: [
    'tin tức điện mặt trời',
    'cơ chế DPPA',
    'giá điện mặt trời 2026',
    'cẩm nang lắp điện mặt trời',
    'chính sách năng lượng tái tạo',
  ],
});

interface NewsPageProps {
  searchParams?: {
    category?: string;
  };
}

export default function NewsPage({ searchParams }: NewsPageProps) {
  const currentCategory = searchParams?.category || 'all';

  const categoryTabs = [
    { label: 'Tất cả bài viết', slug: 'all' },
    { label: 'Chính sách & DPPA', slug: 'chinh-sach' },
    { label: 'Kỹ thuật & Công nghệ', slug: 'ky-thuat' },
    { label: 'Dự án thực tế', slug: 'du-an' },
  ];

  const articles = [
    {
      id: 'art_01',
      title: 'Cơ chế mua bán điện trực tiếp (DPPA) năm 2026: Doanh nghiệp hưởng lợi gì?',
      category: 'chinh-sach',
      categoryLabel: 'Chính sách & DPPA',
      excerpt:
        'Phân tích chi tiết Nghị định về cơ chế DPPA giúp các nhà máy và khu công nghiệp chủ động mua điện sạch trực tiếp với biểu giá tối ưu nhất.',
      date: '05/11/2026',
      readTime: '6 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      slug: 'co-che-mua-ban-dien-truc-tiep-dppa-2026',
    },
    {
      id: 'art_02',
      title: 'Hệ thống Zero-Export là gì? Giải pháp hòa lưới bám tải không phát ngược lên lưới EVN',
      category: 'ky-thuat',
      categoryLabel: 'Kỹ thuật & Công nghệ',
      excerpt:
        'Nguyên lý hoạt động của thiết bị Smart Meter và biến tần hòa lưới bám tải giúp gia đình và doanh nghiệp dùng 100% điện mặt trời tự sản tự tiêu.',
      date: '02/11/2026',
      readTime: '5 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      slug: 'he-thong-zero-export-hoa-luoi-bam-tai',
    },
    {
      id: 'art_03',
      title: 'So sánh pin lưu trữ Lithium LiFePO4 và ắc quy Axit Chì trong hệ thống điện mặt trời',
      category: 'ky-thuat',
      categoryLabel: 'Kỹ thuật & Công nghệ',
      excerpt:
        'Vì sao pin Lithium LiFePO4 thế hệ mới có tuổi thọ trên 15 năm, 6000 chu kỳ sạc xả và độ an toàn chống cháy nổ vượt trội so với ắc quy truyền thống.',
      date: '28/10/2026',
      readTime: '7 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1558441719-f0a5f7823e59?auto=format&fit=crop&w=800&q=80',
      slug: 'so-sanh-pin-lithium-lifepo4-va-ac-quy',
    },
    {
      id: 'art_04',
      title: 'Bàn giao hệ thống điện mặt trời 250kWp tại KCN Nhơn Hội, TP. Quy Nhơn',
      category: 'du-an',
      categoryLabel: 'Dự án thực tế',
      excerpt:
        'BM SOLAR hoàn thành đóng điện và bàn giao hệ thống điện mặt trời áp mái nhà xưởng chế biến thủy sản, tiết kiệm 65 triệu đồng tiền điện mỗi tháng.',
      date: '20/10/2026',
      readTime: '4 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      slug: 'ban-giao-he-thong-dien-mat-troi-250kwp-kcn-nhon-hoi',
    },
    {
      id: 'art_05',
      title: 'Quy trình thẩm duyệt PCCC cho hệ thống điện mặt trời mái nhà công nghiệp',
      category: 'chinh-sach',
      categoryLabel: 'Chính sách & DPPA',
      excerpt:
        'Hướng dẫn hồ sơ pháp lý, khoảng cách an toàn, lối thoát nạn và các tiêu chuẩn đóng cắt khẩn cấp theo Thông tư mới nhất của Cục Cảnh sát PCCC.',
      date: '15/10/2026',
      readTime: '8 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=800&q=80',
      slug: 'quy-trinh-tham-duyet-pccc-dien-mat-troi',
    },
    {
      id: 'art_06',
      title: 'Bảo trì bảo dưỡng hệ thống điện mặt trời định kỳ: Bí quyết duy trì hiệu suất 25 năm',
      category: 'ky-thuat',
      categoryLabel: 'Kỹ thuật & Công nghệ',
      excerpt:
        'Tầm quan trọng của việc vệ sinh tấm pin, kiểm tra siết lực bulong khung giàn và quét camera nhiệt phát hiện điểm nóng Hot-spot định kỳ 6 tháng.',
      date: '10/10/2026',
      readTime: '5 phút đọc',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
      slug: 'bao-tri-bao-duong-dien-mat-troi-dinh-ky',
    },
  ];

  const filteredArticles =
    currentCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === currentCategory);

  const featured = articles[0];
  if (!featured) return null;

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Section matching BM_SOLAR_tin-tuc_desktop.png */}
      <section className="relative w-full min-h-[380px] lg:min-h-[440px] flex items-center bg-[#071F3D] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1920&q=85"
            alt="Tin tức & Cẩm nang BM SOLAR"
            fill
            priority
            className="object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071F3D]/95 via-[#071F3D]/80 to-transparent z-10" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
              TIN TỨC
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Cập nhật thông tin <br />
              <span className="text-accent-orange">Chuyển dịch năng lượng</span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1">
              Tin tức chính sách DPPA, cẩm nang kỹ thuật và xu hướng công nghệ năng lượng mặt trời.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#bai-viet-moi"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold shadow-md shadow-accent-orange/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Xem bài viết mới nhất</span>
                <span>→</span>
              </a>
              <Link
                href="/giai-phap"
                className="px-5 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Xem giải pháp
              </Link>
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
            <span className="text-slate-800">Tin tức</span>
          </nav>
        </div>
      </div>

      {/* 3. Section 01: Bài viết nổi bật (Featured Large Card) */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
              01 / BÀI VIẾT NỔI BẬT
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tiêu điểm năng lượng tái tạo
            </h2>
          </div>

          <Link
            href={`/tin-tuc/${featured.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all block"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-200">
              <Image
                src={featured.imageUrl}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="px-3 py-1 rounded-full bg-accent-orange text-white text-[10px] font-bold">
                  {featured.categoryLabel}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{featured.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featured.readTime}</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-primary transition-colors leading-snug">
                {featured.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {featured.excerpt}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-accent-orange group-hover:translate-x-1 transition-transform">
                  <span>Đọc bài viết đầy đủ</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Section 02: Danh mục bài viết (Grid) */}
      <section id="bai-viet-moi" className="py-12 lg:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-1">
                02 / TẤT CẢ BÀI VIẾT
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cẩm nang kỹ thuật & Kinh nghiệm lắp đặt
              </h2>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryTabs.map((tab) => {
              const active = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.slug === 'all' ? '/tin-tuc' : `/tin-tuc?category=${tab.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    active
                      ? 'bg-accent-orange text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredArticles.map((art) => (
              <Link
                key={art.id}
                href={`/tin-tuc/${art.slug}`}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-primary transition-all duration-300 flex flex-col"
              >
                <div className="h-48 relative bg-slate-100 overflow-hidden">
                  <Image
                    src={art.imageUrl}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {art.categoryLabel}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-accent-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section 03: Blue Section */}
      <ProcessFiveSteps
        tag="03 / CẨM NANG NĂNG LƯỢNG"
        title="Kiến thức chuẩn xác — Kỹ sư đồng hành"
        rightLinkText="Gửi câu hỏi tư vấn →"
        rightLinkHref="/lien-he"
      />

      {/* 6. Section 04: Bottom CTA Banner */}
      <JourneyCtaBanner
        primaryCtaText="Nhận tư vấn giải pháp →"
        secondaryCtaText="Xem các dự án"
        secondaryCtaHref="/du-an"
      />
    </div>
  );
}
