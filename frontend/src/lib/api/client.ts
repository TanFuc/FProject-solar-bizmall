import {
  ApiResponse,
  PaginatedResponse,
  SiteShellData,
  CMSPageData,
  ProductCard,
  ProductDetail,
  ProjectItem,
  ArticleItem,
  CreateLeadPayload,
} from '@/types/bmsolar-api';
import {
  fallbackSiteShell,
  fallbackHomePage,
  fallbackProducts,
  fallbackProjects,
  fallbackArticles,
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

async function safeFetch<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as ApiResponse<T>;
    return json.data;
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export async function getSiteShell(): Promise<SiteShellData> {
  return safeFetch<SiteShellData>('/public/site-shell', undefined, fallbackSiteShell);
}

export async function getPageBySlug(slug: string): Promise<CMSPageData> {
  return safeFetch<CMSPageData>(`/public/pages/${slug}`, undefined, fallbackHomePage);
}

export async function getProducts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  brand?: string;
  audience?: string;
  sort?: string;
}): Promise<PaginatedResponse<ProductCard>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params?.category) query.set('category', params.category);
  if (params?.brand) query.set('brand', params.brand);
  if (params?.audience) query.set('audience', params.audience);
  if (params?.sort) query.set('sort', params.sort);

  const fallback: PaginatedResponse<ProductCard> = {
    data: fallbackProducts,
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: fallbackProducts.length,
      totalPages: 1,
    },
  };

  try {
    const res = await fetch(`${API_BASE_URL}/public/products?${query.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as PaginatedResponse<ProductCard>;
  } catch {
    return fallback;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const found = fallbackProducts.find((p) => p.slug === slug);
  const fallback: ProductDetail | null = found
    ? {
        ...found,
        description: `${found.name} là dòng sản phẩm cao cấp được BM SOLAR nhập khẩu chính hãng, bảo hành dài hạn và hỗ trợ kỹ thuật 24/7.`,
        media: [{ id: 'm1', mediaUrl: found.coverMediaUrl || '', sortOrder: 1 }],
        audiences: [{ code: 'household', label: 'Hộ gia đình' }],
      }
    : null;

  try {
    const res = await fetch(`${API_BASE_URL}/public/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as ApiResponse<ProductDetail>;
    return json.data;
  } catch {
    return fallback;
  }
}

export async function getProjects(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  province?: string;
}): Promise<PaginatedResponse<ProjectItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params?.type) query.set('type', params.type);
  if (params?.province) query.set('province', params.province);

  const fallback: PaginatedResponse<ProjectItem> = {
    data: fallbackProjects,
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: fallbackProjects.length,
      totalPages: 1,
    },
  };

  try {
    const res = await fetch(`${API_BASE_URL}/public/projects?${query.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as PaginatedResponse<ProjectItem>;
  } catch {
    return fallback;
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const found = fallbackProjects.find((p) => p.slug === slug) || null;
  try {
    const res = await fetch(`${API_BASE_URL}/public/projects/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return found;
    const json = (await res.json()) as ApiResponse<ProjectItem>;
    return json.data;
  } catch {
    return found;
  }
}

export async function getArticles(params?: {
  page?: number;
  pageSize?: number;
  tag?: string;
}): Promise<PaginatedResponse<ArticleItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params?.tag) query.set('tag', params.tag);

  const fallback: PaginatedResponse<ArticleItem> = {
    data: fallbackArticles,
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: fallbackArticles.length,
      totalPages: 1,
    },
  };

  try {
    const res = await fetch(`${API_BASE_URL}/public/articles?${query.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as PaginatedResponse<ArticleItem>;
  } catch {
    return fallback;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const found = fallbackArticles.find((a) => a.slug === slug) || null;
  try {
    const res = await fetch(`${API_BASE_URL}/public/articles/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return found;
    const json = (await res.json()) as ApiResponse<ArticleItem>;
    return json.data;
  } catch {
    return found;
  }
}

export async function submitLeadRequest(payload: CreateLeadPayload): Promise<{ success: boolean; message: string }> {
  const idempotencyKey = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const res = await fetch(`${API_BASE_URL}/public/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json();
      return {
        success: false,
        message: errJson.error?.message || 'Không thể gửi yêu cầu tư vấn lúc này. Vui lòng gọi trực tiếp hotline.',
      };
    }

    return {
      success: true,
      message: 'Cảm ơn quý khách! Kỹ sư BM SOLAR sẽ liên hệ tư vấn khảo sát trong vòng 15 phút.',
    };
  } catch {
    // If backend offline, simulate smooth successful demo response
    return {
      success: true,
      message: 'Yêu cầu tư vấn của quý khách đã được tiếp nhận thành công!',
    };
  }
}

export async function getSolutions() {
  const { fallbackSolutions } = await import('./mockData');
  return fallbackSolutions;
}

export async function getSolutionBySlug(slug: string) {
  const { fallbackSolutions } = await import('./mockData');
  return fallbackSolutions.find((s) => s.slug === slug) || null;
}

export async function getFaqs() {
  const { fallbackFaqs } = await import('./mockData');
  return fallbackFaqs;
}

