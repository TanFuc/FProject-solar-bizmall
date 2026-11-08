import {
  ProductDetail,
  ProductCard,
  ArticleItem,
  ProjectItem,
  BranchItem,
  SiteShellData,
} from '@/types/bmsolar-api';
import { DetailedSolution } from '@/lib/api/mockData';

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

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PostalAddressSchema {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface ContactPointSchema {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  areaServed: string;
  availableLanguage?: string[];
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  alternateName?: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  sameAs?: string[];
  telephone?: string;
  email?: string;
  contactPoint?: ContactPointSchema[];
  address?: PostalAddressSchema[];
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  '@id': string;
  name: string;
  url: string;
  telephone?: string;
  email?: string;
  image: string;
  priceRange: string;
  address?: PostalAddressSchema;
  parentOrganization?: {
    '@id': string;
  };
}

/**
 * Generates Schema.org Organization structured data derived dynamically
 * from live SiteShellData (brand, active branches, contact channels, social links).
 * Does NOT emit factual branch schema or invented addresses when no live shell is provided.
 */
export function getOrganizationSchema(shell?: Partial<SiteShellData> | null): OrganizationSchema {
  const brandName = shell?.brand?.name || 'BM SOLAR';
  const logoUrl = shell?.brand?.logo?.url
    ? shell.brand.logo.url.startsWith('http')
      ? shell.brand.logo.url
      : `${SITE_URL}${shell.brand.logo.url.startsWith('/') ? '' : '/'}${shell.brand.logo.url}`
    : `${SITE_URL}/images/logo.png`;

  // Dynamically derive social links from footer
  const sameAs: string[] = [];
  if (Array.isArray(shell?.footer?.socialLinks)) {
    for (const link of shell.footer.socialLinks) {
      if (link.target && (link.target.startsWith('http://') || link.target.startsWith('https://'))) {
        sameAs.push(link.target);
      }
    }
  }

  // Dynamically derive contact points and addresses from active branches in shell
  const contactPoints: ContactPointSchema[] = [];
  const activeBranches = Array.isArray(shell?.utilityBar?.branches)
    ? shell.utilityBar.branches.filter((b) => b.isActive)
    : [];

  for (const branch of activeBranches) {
    if (Array.isArray(branch.channels)) {
      for (const ch of branch.channels) {
        if (ch.type === 'phone' && ch.target) {
          contactPoints.push({
            '@type': 'ContactPoint',
            telephone: ch.target,
            contactType: branch.name || 'customer service',
            areaServed: 'VN',
          });
        }
      }
    }
  }

  // Derive addresses strictly from supplied active branches - no invented postal codes/coordinates
  const addresses: PostalAddressSchema[] = activeBranches
    .filter((b) => Boolean(b.streetAddress))
    .map((b) => ({
      '@type': 'PostalAddress',
      streetAddress: b.streetAddress,
      addressCountry: 'VN',
    }));

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: brandName,
    alternateName: 'BM SOLAR Việt Nam',
    url: SITE_URL,
    logo: logoUrl,
    image: logoUrl,
    description:
      'Tổng thầu EPC điện mặt trời, pin lưu trữ BESS và trạm sạc xe điện uy tín tại Việt Nam.',
  };

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }
  if (contactPoints.length > 0) {
    schema.contactPoint = contactPoints;
    const firstPhone = contactPoints[0]?.telephone;
    if (firstPhone) {
      schema.telephone = firstPhone;
    }
  }
  if (addresses.length > 0) {
    schema.address = addresses;
  }

  return schema;
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
 * Generates Schema.org LocalBusiness structured data.
 * Derives details directly from BranchItem when supplied.
 * Legacy string calls do NOT fabricate branch facts, coordinates or postal codes.
 */
export function getLocalBusinessSchema(
  branch?: 'quynhon' | 'tphcm' | 'go-vap' | 'quy-nhon' | BranchItem | string | null
): LocalBusinessSchema {
  if (branch && typeof branch === 'object') {
    const phoneChannel = branch.channels?.find((c) => c.type === 'phone');
    const emailChannel = branch.channels?.find((c) => c.type === 'email');
    const schema: LocalBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#branch-${branch.slug}`,
      name: branch.name,
      url: `${SITE_URL}/lien-he`,
      image: `${SITE_URL}/images/logo.png`,
      priceRange: '$$$',
      parentOrganization: {
        '@id': `${SITE_URL}/#organization`,
      },
    };

    if (branch.streetAddress) {
      schema.address = {
        '@type': 'PostalAddress',
        streetAddress: branch.streetAddress,
        addressCountry: 'VN',
      };
    }
    if (phoneChannel?.target) {
      schema.telephone = phoneChannel.target;
    }
    if (emailChannel?.target) {
      schema.email = emailChannel.target;
    }
    return schema;
  }

  // When only legacy string or no BranchItem is supplied, do NOT fabricate branch facts.
  const branchSlug = typeof branch === 'string' ? branch : 'headquarters';
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#branch-${branchSlug}`,
    name: 'BM SOLAR',
    url: `${SITE_URL}/lien-he`,
    image: `${SITE_URL}/images/logo.png`,
    priceRange: '$$$',
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
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

  // No merchant Offer: this API does not provide a verified numeric price or inventory.

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
    datePublished: article.publishedAt || undefined,
    dateModified: article.publishedAt || undefined,
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
      '@id': `${SITE_URL}/#organization`,
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
      '@id': `${SITE_URL}/#organization`,
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
