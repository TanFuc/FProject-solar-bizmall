import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticles } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';

interface ArticleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.data.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return constructMetadata({ title: 'Không Tìm Thấy Bài Viết' });
  }

  return constructMetadata({
    title: `${article.title} | BM SOLAR`,
    description: article.excerpt,
    canonicalPath: `/tin-tuc/${article.slug}`,
    ogImage: article.coverMediaUrl,
    keywords: [
      article.title,
      article.category || 'Điện mặt trời',
      'kiến thức năng lượng mặt trời',
      'BM Solar tin tức',
    ],
  });
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = getArticleSchema(article);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Tin tức', url: '/tin-tuc' },
    { name: article.title, url: `/tin-tuc/${article.slug}` },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      {/* 1. Breadcrumb */}
      <div className="bg-surface border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/tin-tuc" className="hover:text-brand-primary transition-colors">
              Tin tức
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Article Header */}
      <article className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-4">
          {article.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-bold">
              {article.category}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-2 border-y border-slate-100 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <User className="w-4 h-4 text-brand-primary" />
              Ban Biên Tập BM SOLAR
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-orange" />
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
                : 'Mới cập nhật'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {article.readTimeMinutes || 5} phút đọc
            </span>
          </div>
        </header>

        {/* Lead Excerpt */}
        <p className="text-base sm:text-lg text-ink font-medium leading-relaxed italic border-l-4 border-accent-orange pl-4 bg-surface py-3 rounded-r-xl">
          {article.excerpt}
        </p>

        {/* Featured Cover Image */}
        {article.coverMediaUrl && (
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 shadow-card">
            <Image
              src={article.coverMediaUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover object-center"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-slate max-w-none text-ink text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            Điện năng lượng mặt trời mái nhà đang bước vào giai đoạn phát triển bùng nổ tại Việt Nam nhờ các chính sách thúc đẩy năng lượng tái tạo tự sản tự tiêu và sự hoàn thiện vượt bậc của công nghệ lưu trữ pin Lithium BESS.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-ink pt-4">
            1. Những điểm mới quan trọng trong cơ chế chính sách 2026
          </h2>
          <p>
            Các tổ chức, cá nhân lắp đặt hệ thống điện mặt trời trên mái nhà công trình xây dựng (nhà ở, cơ quan công sở, khu công nghiệp) để tự dùng hiện được tạo điều kiện tối đa về mặt cấp phép. Với các hệ thống không phát ngược điện lên lưới quốc gia (Zero-Export), thủ tục đăng ký chỉ mang tính thông báo đối soát kỹ thuật với đơn vị điện lực.
          </p>

          <div className="p-5 rounded-xl bg-surface border border-slate-200/80 my-4 space-y-2">
            <h4 className="font-bold text-ink text-sm flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-brand-primary" />
              Lưu ý kỹ thuật quan trọng từ BM SOLAR:
            </h4>
            <ul className="text-xs sm:text-sm text-ink-muted space-y-1.5 list-disc pl-5">
              <li>Lựa chọn các thương hiệu biến tần Inverter chuẩn Tier 1 có tích hợp sẵn cổng giao tiếp Zero-Export.</li>
              <li>Kiểm định tải trọng kết cấu mái và trang bị hệ thống ngắt mạch an toàn PCCC tự động.</li>
              <li>Sử dụng tấm pin công nghệ N-Type TOPCon có hệ số suy hao nhiệt độ thấp để duy trì hiệu suất mùa nắng gắt.</li>
            </ul>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-ink pt-4">
            2. Bài toán kinh tế và thời gian thu hồi vốn thực tế
          </h2>
          <p>
            Nhờ giá thành tấm pin quang điện và pin lưu trữ lithium giảm hơn 30% trong 2 năm qua, thời gian thu hồi vốn của một hệ thống điện mặt trời áp mái tiêu chuẩn hiện chỉ còn <strong>3.5 đến 4.5 năm</strong>. Trong khi đó, tuổi thọ vận hành thực tế của hệ thống kéo dài trên 25 năm, đem lại nguồn lợi nhuận ròng đáng kể cho chủ đầu tư.
          </p>

          <p>
            Đội ngũ kỹ sư BM SOLAR tại TP. Quy Nhơn (Bình Định) và TP. Hồ Chí Minh luôn sẵn sàng hỗ trợ khảo sát thực tế 3D, tính toán công suất phù hợp nhất với biểu đồ tiêu thụ điện của gia đình và doanh nghiệp.
          </p>
        </div>

        {/* Share & Return */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh mục tin tức</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>Chia sẻ bài viết</span>
          </div>
        </div>
      </article>

      {/* 3. Consultation Form */}
      <ConsultationFormBlock
        headline="Nhận Tư Vấn Kỹ Thuật Miễn Phí Từ Kỹ Sư BM SOLAR"
        subheading="Liên hệ ngay để được phân tích biểu đồ phụ tải và lập dự toán chi phí chi tiết."
      />
    </div>
  );
}

