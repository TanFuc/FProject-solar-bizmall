import { MetadataRoute } from 'next';
import {
  getProducts,
  getProjects,
  getArticles,
} from '@/lib/api/client';
import { ProductCard, ProjectItem, ArticleItem } from '@/types/bmsolar-api';

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
const BASE_BUILD_DATE = new Date('2026-03-01T08:00:00Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Seven main primary public routes
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

  // Retrieve published records safely without demo/fallback fabricated URLs
  let productsList: ProductCard[] = [];
  try {
    const res = await getProducts({ pageSize: 100 });
    if (res?.data?.length) {
      productsList = res.data;
    }
  } catch {
    // Return empty list on failure - do not fabricate fake records
  }

  let projectsList: ProjectItem[] = [];
  try {
    const res = await getProjects({ pageSize: 100 });
    if (res?.data?.length) {
      projectsList = res.data;
    }
  } catch {
    // Return empty list on failure - do not fabricate fake records
  }

  let articlesList: ArticleItem[] = [];
  try {
    const res = await getArticles({ pageSize: 100 });
    if (res?.data?.length) {
      articlesList = res.data;
    }
  } catch {
    // Return empty list on failure - do not fabricate fake records
  }

  // Dynamic Product URLs
  const productRoutes: MetadataRoute.Sitemap = productsList.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    lastModified: BASE_BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic Project URLs
  const projectRoutes: MetadataRoute.Sitemap = projectsList.map((p) => ({
    url: `${SITE_URL}/du-an/${p.slug}`,
    lastModified: p.completedAt ? new Date(`${p.completedAt}T00:00:00Z`) : BASE_BUILD_DATE,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic Article URLs
  const articleRoutes: MetadataRoute.Sitemap = articlesList.map((a) => ({
    url: `${SITE_URL}/tin-tuc/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : BASE_BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...projectRoutes, ...articleRoutes];
}
