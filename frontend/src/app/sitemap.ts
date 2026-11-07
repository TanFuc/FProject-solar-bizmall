import { MetadataRoute } from 'next';
import {
  fallbackProducts,
  fallbackProjects,
  fallbackArticles,
  fallbackSolutions,
} from '@/lib/api/mockData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmsolar.vn';
const BASE_BUILD_DATE = new Date('2026-03-01T08:00:00Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/gioi-thieu`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/giai-phap`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/san-pham`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/du-an`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tin-tuc`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/lien-he`,
      lastModified: BASE_BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic Solution URLs
  const solutionRoutes: MetadataRoute.Sitemap = fallbackSolutions.map((s) => ({
    url: `${SITE_URL}/giai-phap/${s.slug}`,
    lastModified: BASE_BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Product URLs
  const productRoutes: MetadataRoute.Sitemap = fallbackProducts.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    lastModified: BASE_BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic Project URLs
  const projectRoutes: MetadataRoute.Sitemap = fallbackProjects.map((p) => ({
    url: `${SITE_URL}/du-an/${p.slug}`,
    lastModified: p.completedAt ? new Date(`${p.completedAt}T00:00:00Z`) : BASE_BUILD_DATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic Article URLs - use real publishedAt
  const articleRoutes: MetadataRoute.Sitemap = fallbackArticles.map((a) => ({
    url: `${SITE_URL}/tin-tuc/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : BASE_BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...solutionRoutes, ...productRoutes, ...projectRoutes, ...articleRoutes];
}
