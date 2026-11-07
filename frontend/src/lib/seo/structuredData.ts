import {
  ProductDetail,
  ProductCard,
  ArticleItem,
  ProjectItem,
  BranchItem,
} from '@/types/bmsolar-api';
import { DetailedSolution } from '@/lib/api/mockData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmsolar.vn';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generates Schema.org Organization structured data.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Công ty TNHH Năng Lượng BM SOLAR',
    alternateName: 'BM SOLAR Việt Nam',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    description:
      'Tổng thầu EPC điện mặt trời, pin lưu trữ BESS và trạm sạc xe điện uy tín tại Quy Nhơn, TP.HCM và toàn quốc.',
    telephone: '+84932456789',
    email: 'kinhdoanh@bmsolar.vn',
    sameAs: [
      'https://www.facebook.com/bmsolar.vn',
      'https://zalo.me/0932456789',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+84932456789',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English'],
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '01 Lê Duẩn, P. Lý Thường Kiệt',
        addressLocality: 'TP. Quy Nhơn',
        addressRegion: 'Bình Định',
        postalCode: '590000',
        addressCountry: 'VN',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '568 Quang Trung, Phường 11',
        addressLocality: 'Quận Gò Vấp',
        addressRegion: 'TP. Hồ Chí Minh',
        postalCode: '700000',
        addressCountry: 'VN',
      },
    ],
  };
}

/**
 * Generates Schema.org WebSite structured data with SearchAction.
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'BM SOLAR — Giải Pháp Điện Mặt Trời & Lưu Trữ Năng Lượng',
    url: SITE_URL,
    inLanguage: 'vi-VN',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/san-pham?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org LocalBusiness structured data for specific branch or default HQ.
 */
export function getLocalBusinessSchema(branch?: 'quynhon' | 'tphcm' | BranchItem) {
  if (branch && typeof branch === 'object') {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#branch-${branch.slug}`,
      name: `BM SOLAR — ${branch.name}`,
      url: `${SITE_URL}/lien-he`,
      telephone: branch.channels.find((c) => c.type === 'phone')?.target || '+84932456789',
      image: `${SITE_URL}/images/logo.png`,
      priceRange: '$$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: branch.streetAddress,
        addressCountry: 'VN',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:30',
        closes: '17:30',
      },
    };
  }

  if (branch === 'tphcm') {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#branch-tphcm`,
      name: 'BM SOLAR — Văn Phòng Đại Diện TP. Hồ Chí Minh',
      url: `${SITE_URL}/lien-he`,
      telephone: '+84987654321',
      email: 'hcm@bmsolar.vn',
      image: `${SITE_URL}/images/logo.png`,
      priceRange: '$$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '568 Quang Trung, Phường 11',
        addressLocality: 'Quận Gò Vấp',
        addressRegion: 'TP. Hồ Chí Minh',
        postalCode: '700000',
        addressCountry: 'VN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 10.8427,
        longitude: 106.6578,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:30',
        closes: '17:30',
      },
    };
  }

  // Default Quy Nhơn HQ
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#headquarters-quynhon`,
    name: 'BM SOLAR — Trụ Sở Chính Quy Nhơn',
    url: `${SITE_URL}/lien-he`,
    telephone: '+84932456789',
    email: 'kinhdoanh@bmsolar.vn',
    image: `${SITE_URL}/images/logo.png`,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '01 Lê Duẩn, P. Lý Thường Kiệt',
      addressLocality: 'TP. Quy Nhơn',
      addressRegion: 'Bình Định',
      postalCode: '590000',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.7745,
      longitude: 109.2215,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:30',
      closes: '17:30',
    },
  };
}

/**
 * Generates Schema.org Product structured data grounded strictly in verified product facts.
 */
export function getProductSchema(product: ProductDetail | ProductCard) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary || product.name,
    sku: product.sku || product.id,
    image: product.coverMediaUrl
      ? product.coverMediaUrl.startsWith('http')
        ? product.coverMediaUrl
        : `${SITE_URL}${product.coverMediaUrl}`
      : `${SITE_URL}/images/logo.png`,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'BM SOLAR',
    },
  };

  if (product.category?.name) {
    schema.category = product.category.name;
  }

  // Grounded pricing: only emit Offer if real price is verified
  if (product.priceEstimate && !product.priceEstimate.toLowerCase().includes('liên hệ')) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/san-pham/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'BM SOLAR Việt Nam',
      },
    };
  }

  return schema;
}

/**
 * Generates Schema.org Article / BlogPosting structured data.
 */
export function getArticleSchema(article: ArticleItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.coverMediaUrl
      ? article.coverMediaUrl.startsWith('http')
        ? article.coverMediaUrl
        : `${SITE_URL}${article.coverMediaUrl}`
      : `${SITE_URL}/images/logo.png`,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Ban Kỹ Thuật BM SOLAR',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BM SOLAR Việt Nam',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/tin-tuc/${article.slug}`,
    },
  };
}

/**
 * Generates Schema.org Service structured data for EPC Solar Solutions.
 */
export function getSolutionSchema(solution: DetailedSolution) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    serviceType: 'Tổng Thầu EPC Điện Mặt Trời & Lưu Trữ BESS',
    description: solution.subtitle || solution.overview,
    provider: {
      '@type': 'Organization',
      name: 'BM SOLAR Việt Nam',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Việt Nam',
    },
  };
}

/**
 * Generates Schema.org CreativeWork structured data for Engineering Projects.
 */
export function getProjectSchema(project: ProjectItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    creator: {
      '@type': 'Organization',
      name: 'BM SOLAR Việt Nam',
    },
    locationCreated: {
      '@type': 'Place',
      name: project.province?.name || 'Việt Nam',
    },
    datePublished: project.completedAt ? project.completedAt : undefined,
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
