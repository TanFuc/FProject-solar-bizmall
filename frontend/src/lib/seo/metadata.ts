import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmsolar.vn';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  keywords?: string[];
}

export function constructMetadata({
  title = 'BM SOLAR — Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ Năng Lượng',
  description = 'BM SOLAR chuyên tư vấn, thiết kế và thi công trọn gói điện mặt trời mái nhà hòa lưới, pin lưu trữ BESS và trạm sạc EV tại Quy Nhơn, TP.HCM.',
  canonicalPath = '/',
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
}: SEOProps = {}): Metadata {
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title: {
      default: title,
      template: '%s | BM SOLAR Việt Nam',
    },
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'vi-VN': canonicalUrl,
        'en-US': `${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}lang=en`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BM SOLAR Việt Nam',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
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

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Công ty TNHH Năng Lượng BM SOLAR',
    alternateName: 'BM SOLAR Việt Nam',
    url: 'https://bmsolar.vn',
    logo: 'https://bmsolar.vn/images/logo.png',
    image: 'https://bmsolar.vn/images/logo.png',
    description: 'Tổng thầu EPC điện mặt trời, pin lưu trữ BESS và trạm sạc xe điện uy tín tại Việt Nam.',
    telephone: '+84932456789',
    email: 'kinhdoanh@bmsolar.vn',
    priceRange: '$$$',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '01 Lê Duẩn, P. Lý Thường Kiệt',
        addressLocality: 'TP. Quy Nhơn',
        addressRegion: 'Bình Định',
        addressCountry: 'VN',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '568 Quang Trung, Phường 11',
        addressLocality: 'Quận Gò Vấp',
        addressRegion: 'TP. Hồ Chí Minh',
        addressCountry: 'VN',
      },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:30',
      closes: '17:30',
    },
  };
}

