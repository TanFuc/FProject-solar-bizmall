import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { RichDocument } from '@/components/ui/RichDocument';
import { getCurrentContentLocale } from '@/lib/api/localized-page';
import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/api/client';
import { constructMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { ConsultationFormBlock } from '@/components/blocks/ConsultationFormBlock';
import {
  ShieldCheck,
  Zap,
  Download,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.data.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const product = await getProductBySlug(slug, locale);
  if (!product) {
    return constructMetadata({ title: 'Không Tìm Thấy Sản Phẩm', noIndex: true, canonicalPath: `/san-pham/${slug}` });
  }

  return constructMetadata({
    title: `${product.name} | BM SOLAR`,
    description: product.summary,
    canonicalPath: `/san-pham/${product.slug}`,
    contentLocale: locale,
    englishAvailable: product.hasEnglish,
    ogImage: product.coverMediaUrl,
    keywords: [
      product.name,
      product.sku,
      product.brand?.name || 'BM SOLAR',
      product.category?.name || 'Điện mặt trời',
    ],
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const locale = await getCurrentContentLocale();
  const ui = (vi: string, en: string) => locale === "en-US" ? en : vi;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  const labels: Record<string, string> = {
    capacityAh: ui("Dung lượng (Ah)", "Capacity (Ah)"), capacityKWh: ui("Năng lượng (kWh)", "Energy (kWh)"),
    cycleLife: ui("Chu kỳ sạc/xả", "Cycle life"), dod: ui("Độ sâu xả (DoD)", "Depth of discharge (DoD)"),
    nominalVoltage: ui("Điện áp danh định", "Nominal voltage"),
    powerKW: ui("Công suất (kW)", "Rated power (kW)"), batteryVoltage: ui("Điện áp pin", "Battery voltage"), ipRating: ui("Cấp bảo vệ", "IP rating"),
    maxEfficiency: ui("Hiệu suất tối đa", "Maximum efficiency"), phase: ui("Số pha", "Phases"), warrantyYears: ui("Bảo hành (năm)", "Warranty (years)"),
  };
  const specs = [
    { label: "Model / SKU", value: product.sku },
    ...Object.entries(product.specsParsed || {}).map(([key, value]) => ({
      label: labels[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2"), value,
    })),
  ];

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: ui("Trang chủ", "Home"), url: '/' },
    { name: ui("Sản phẩm", "Products"), url: '/san-pham' },
    { name: product.name, url: `/san-pham/${product.slug}` },
  ]);

  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      {/* 1. Breadcrumb */}
      <div className="bg-surface border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-primary transition-colors">
              {ui("Trang chủ", "Home")}
            </Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-brand-primary transition-colors">
              {ui("Sản phẩm", "Products")}
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Main Product Info */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Gallery / Image Left */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full h-80 sm:h-[450px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={product.coverMediaUrl || '/images/designs/san-pham-1.png'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {product.tier && (
                <span className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.tier}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-surface border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-ink font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {ui("Cam kết hàng chính hãng 100%", "Genuine equipment")}
              </span>
              <span className="text-slate-500">{ui("Bảo hành", "Warranty")} {product.warrantyYears || 5} {ui("năm", "years")}</span>
            </div>
          </div>

          {/* Details / Action Right */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
                  {product.category?.name}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono text-slate-500">{product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            <p className="text-sm text-ink-muted leading-relaxed">
              {product.summary}
            </p>

            <div className="p-4 rounded-xl bg-accent-light/50 border border-accent-orange/20 space-y-1">
              <span className="text-xs text-ink-muted">{ui("Báo giá tham khảo:", "Indicative pricing:")}</span>
              <p className="text-xl font-black text-accent-orange">
                {product.priceEstimate || ui("Liên hệ nhận báo giá chiết khấu tốt nhất", "Contact us for a quote")}
              </p>
              <p className="text-[11px] text-ink-muted">
                {ui("* Áp dụng chiết khấu đặc biệt cho đại lý và đơn hàng số lượng lớn theo dự án.", "Special pricing may apply to dealers and bulk project orders.")}
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="orange"
                size="lg"
                href="#tu-van"
                icon={<Sparkles className="w-4 h-4" />}
              >
                {ui("Yêu Cầu Báo Giá Ngay", "Request a quote")}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border border-slate-200"
                icon={<Download className="w-4 h-4" />}
              >
                {ui("Tải Datasheet PDF", "Download datasheet")}
              </Button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-ink">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{ui("CO/CQ chính hãng", "Certificates of origin and quality")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{ui("Giao hàng toàn quốc", "Nationwide delivery")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{ui("Hỗ trợ kỹ thuật 24/7", "24/7 technical support")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{ui("Đổi mới lỗi kỹ thuật", "Replacement for technical defects")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="solar-long-content"><RichDocument value={product.documentJson || product.description} className="solar-document-column" /></div>

        {/* 3. Detailed Specifications Table */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              {ui("Thông Số Kỹ Thuật Chi Tiết", "Technical specifications")}
            </h2>

            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs sm:text-sm">
                <tbody className="divide-y divide-slate-100">
                  {specs.map((s, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-surface' : 'bg-white'}
                    >
                      <td className="p-3.5 sm:p-4 font-semibold text-ink w-1/3">
                        {s.label}
                      </td>
                      <td className="p-3.5 sm:p-4 text-ink-muted">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Consultation Form */}
      <ConsultationFormBlock
        headline={ui("Nhận báo giá cho", "Request a quote for") + " " + product.name}
        subheading={ui("Để lại thông tin để nhân viên kinh doanh BM SOLAR gửi bảng báo giá chi tiết và hỗ trợ kỹ thuật.", "Leave your details so BM SOLAR can send a quote and provide technical advice.")}
      />
      <ContentSuggestions kind="products" slug={slug} group={product.category?.slug} />
    </div>
  );
}

