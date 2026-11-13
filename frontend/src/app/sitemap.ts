import { MetadataRoute } from 'next';
import {
  getProducts,
  getProjects,
  getArticles,
  getSolutions,
} from '@/lib/api/client';
import { PaginatedResponse } from '@/types/bmsolar-api';

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

async function listForSitemap<T extends { slug: string }>(load: (params: { page: number; pageSize: number }) => Promise<PaginatedResponse<T>>) {
  const records = new Map<string, T>();
  for (let page = 1; page <= 1000; page++) {
    const result = await load({ page, pageSize: 50 });
    for (const row of result.data) records.set(row.slug, row);
    if (page >= result.meta.totalPages || !result.data.length) break;
  }
  return [...records.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Seven main primary public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,

      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/gioi-thieu`,

      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/giai-phap`,

      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/san-pham`,

      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/du-an`,

      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tin-tuc`,

      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/lien-he`,

      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const [productsList, projectsList, articlesList, solutions] = await Promise.all([
    listForSitemap(getProducts), listForSitemap(getProjects), listForSitemap(getArticles), getSolutions("vi-VN", true),
  ]);

  // Dynamic Product URLs
  const productRoutes: MetadataRoute.Sitemap = productsList.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,

    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Dynamic Project URLs
  const projectRoutes: MetadataRoute.Sitemap = projectsList.map((p) => ({
    url: `${SITE_URL}/du-an/${p.slug}`,

    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic Article URLs
  const articleRoutes: MetadataRoute.Sitemap = articlesList.map((a) => ({
    url: `${SITE_URL}/tin-tuc/${a.slug}`,
    ...(a.publishedAt?{lastModified:new Date(a.publishedAt)}:{}),

    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const solutionRoutes: MetadataRoute.Sitemap = solutions.map(solution => ({
    url: `${SITE_URL}/giai-phap/${solution.slug}`, changeFrequency: "monthly", priority: 0.7,
  }));
  return [...staticRoutes, ...productRoutes, ...projectRoutes, ...articleRoutes, ...solutionRoutes];
}
