import { Metadata } from 'next';

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://bmsolar.vn';
}

const SITE_URL = getSiteUrl();

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  contentLocale?: "vi-VN" | "en-US";
  englishAvailable?: boolean;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Constructs standard Next.js metadata with verified canonicals,
 * OpenGraph, Twitter, icons, and language alternates.
 * Strips duplicate brand suffixes to prevent double branding with template.
 */
export function constructMetadata({
  title = 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
  description = 'BM SOLAR chuyên tư vấn, thiết kế và thi công trọn gói điện mặt trời mái nhà hòa lưới, pin lưu trữ BESS và trạm sạc EV tại Quy Nhơn, TP.HCM.',
  canonicalPath = '/',
  contentLocale = 'vi-VN',
  englishAvailable = false,
  ogImage = '/images/logo.png',
  keywords = [
    'điện mặt trời BM Solar',
    'lắp điện mặt trời Quy Nhơn',
    'lắp điện mặt trời TP.HCM',
    'inverter hybrid deye',
    'tấm pin canadian solar 550w',
    'pin lưu trữ lithium BESS',
    'tổng thầu EPC solar',
  ],
  noIndex = false,
}: SEOProps = {}): Metadata {
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const vietnameseUrl = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath.replace(/\/$/, '')}`;
  const englishUrl = cleanPath === "/" ? vietnameseUrl + "/en" : vietnameseUrl + "?lang=en";
  const canonicalUrl = contentLocale === "en-US" && englishAvailable ? englishUrl : vietnameseUrl;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  // Prevent title/template duplication: remove trailing ' | BM SOLAR...' from child page titles
  const cleanTitle = title.replace(/\s*\|\s*BM\s+SOLAR(?:\s+Việt\s+Nam)?$/i, '').trim();
  const effectiveTitle = cleanTitle.length > 0 ? cleanTitle : title;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: effectiveTitle,
      template: '%s | BM SOLAR Việt Nam',
    },
    description,
    keywords,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/images/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/favicon-64.png', sizes: '64x64', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/images/favicon-180.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'vi-VN': vietnameseUrl,
        ...(englishAvailable ? { 'en-US': englishUrl } : {}),
        'x-default': vietnameseUrl,
      },
    },
    openGraph: {
      title: effectiveTitle,
      description,
      url: canonicalUrl,
      siteName: 'BM SOLAR Việt Nam',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: effectiveTitle,
        },
      ],
      locale: contentLocale === 'en-US' ? 'en_US' : 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: effectiveTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
