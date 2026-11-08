import { articleFromApi, listFromApi, productFromApi, projectFromApi } from './public-adapters';
import { items, category, audience, object } from './blocks';
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
  ProductCategoryItem,
  AudienceItem,
  DetailedSolution,
  ContactChannelItem,
} from '@/types/bmsolar-api';

export interface BrandSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
}

const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const API_BASE_URL = apiOrigin.endsWith('/api/v1') ? apiOrigin : `${apiOrigin}/api/v1`;

// Bounded in-memory cache for truly shared stable public catalog metadata (TTL: 30 seconds)
// CMS pages and SiteShell rely strictly on in-flight de-duplication per render and are not cached here.
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const stableCache = new Map<string, CacheEntry<unknown>>();
let cacheGeneration=0;
const CACHE_TTL_MS = 30_000;

function getCached<T>(key: string): T | undefined {
  const entry = stableCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    stableCache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS, generation=cacheGeneration): void {
  if(generation!==cacheGeneration)return;
  if (stableCache.size > 200) {
    const oldestKey = stableCache.keys().next().value;
    if (oldestKey) stableCache.delete(oldestKey);
  }
  stableCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate in-memory cached responses and pending in-flight requests.
 * Route integration guidance: Call this when CMS publishes new products/categories
 * or updates site settings so clients immediately see fresh data.
 */
export function invalidatePublicCache(pattern?: string): void {
  cacheGeneration++;
  if (!pattern) {
    stableCache.clear();
    inFlightRequests.clear();
  } else {
    for (const key of stableCache.keys()) {
      if (key.includes(pattern)) {
        stableCache.delete(key);
      }
    }
    for (const key of inFlightRequests.keys()) {
      if (key.includes(pattern)) {
        inFlightRequests.delete(key);
      }
    }
  }
}

// In-flight request de-duplication: avoid dispatching duplicate GET requests concurrently
const inFlightRequests = new Map<string, Promise<Response>>();

async function publicFetch(url: string, options?: RequestInit): Promise<Response> {
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';

  if (isGet && inFlightRequests.has(url)) {
    const pending = inFlightRequests.get(url)!;
    return pending.then((res) => res.clone());
  }

  const fetchPromise = (async () => {
    for (let attempt = 0; ; attempt++) {
      const { next, ...rest } = options || {};
      const response = await fetch(url, attempt ? { ...rest, cache: 'no-store' } : options);

      if (response.status !== 429 || attempt >= 2) {
        return response;
      }

      // Retry-After header with exponential backoff and randomized jitter to prevent retry storms
      const retryHeader = response.headers.get('Retry-After');
      const baseSeconds = retryHeader ? Math.min(3, Math.max(1, Number(retryHeader) || 1)) : 1;
      const backoffMs = baseSeconds * 1000 * Math.pow(1.5, attempt) + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  })();

  if (isGet) {
    inFlightRequests.set(url, fetchPromise);
    fetchPromise
      .catch(() => {})
      .finally(() => {
        if(inFlightRequests.get(url)===fetchPromise)inFlightRequests.delete(url);
      });
  }

  return fetchPromise;
}

async function safeFetch<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await publicFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
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
  return safeFetch<SiteShellData>('/public/site-shell');
}

export async function getPageBySlug(slug: string): Promise<CMSPageData> {
  return safeFetch<CMSPageData>(`/public/pages/${slug}`);
}

export async function getProducts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  brand?: string;
  audience?: string;
  sort?: string;
  search?: string;
}): Promise<PaginatedResponse<ProductCard>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params?.category) query.set('category', params.category);
  if (params?.brand) query.set('brand', params.brand);
  if (params?.audience) query.set('audience', params.audience);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.search) query.set('search',params.search);

  const fallback: PaginatedResponse<ProductCard> = {
    data: [],
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: 0,
      totalPages: 1,
    },
  };

  try {
    const res = await publicFetch(`${API_BASE_URL}/public/products?${query.toString()}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return fallback;
    return listFromApi(await res.json(), productFromApi);
  } catch {
    return fallback;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const fallback: ProductDetail | null = null;

  try {
    const res = await publicFetch(`${API_BASE_URL}/public/products/${slug}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return fallback;
    const json:unknown=await res.json();if(!object(json)||!object(json.data))return null;
    const raw=json.data;const card=productFromApi(raw);if(!card)return null;
    const gallery=Array.isArray(raw.gallery)?raw.gallery.filter((url):url is string=>typeof url==='string'):[];
    const specifications:Record<string,string>={};if(object(raw.specifications))for(const [key,value]of Object.entries(raw.specifications)){if(typeof value==='string'||typeof value==='number')specifications[key]=String(value);}
    return {...card,description:typeof raw.description==='string'?raw.description:'',media:gallery.map((url,index)=>({id:url,mediaUrl:url,sortOrder:index})),audiences:[],specsParsed:specifications};
  } catch {
    return fallback;
  }
}

export async function getProjects(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  province?: string;
  search?:string;
}): Promise<PaginatedResponse<ProjectItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params?.type) query.set('projectType', params.type);
  if (params?.province) query.set('province', params.province);
  if (params?.search) query.set('search',params.search);

  const fallback: PaginatedResponse<ProjectItem> = {
    data: [],
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: 0,
      totalPages: 1,
    },
  };

  try {
    const res = await publicFetch(`${API_BASE_URL}/public/projects?${query.toString()}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return fallback;
    return listFromApi(await res.json(), projectFromApi);
  } catch {
    return fallback;
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const found = null;
  try {
    const res = await publicFetch(`${API_BASE_URL}/public/projects/${slug}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return found;
    const json:unknown=await res.json();if(!object(json)||!object(json.data))return null;
    const raw=json.data;const item=projectFromApi(raw);if(!item)return null;
    if(object(raw.projectType)&&typeof raw.projectType.name==='string'&&typeof raw.projectType.slug==='string')item.projectType={name:raw.projectType.name,slug:raw.projectType.slug};
    if(object(raw.province)&&typeof raw.province.name==='string'&&typeof raw.province.code==='string')item.province={name:raw.province.name,code:raw.province.code};return item;
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
    data: [],
    meta: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 12,
      total: 0,
      totalPages: 1,
    },
  };

  try {
    const res = await publicFetch(`${API_BASE_URL}/public/articles?${query.toString()}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return fallback;
    return listFromApi(await res.json(), articleFromApi);
  } catch {
    return fallback;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const found = null;
  try {
    const res = await publicFetch(`${API_BASE_URL}/public/articles/${slug}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (!res.ok) return found;
    const json:unknown=await res.json();if(!object(json)||!object(json.data))return null;
    const item=articleFromApi(json.data);return item?{...item,bodyJson:typeof json.data.bodyJson==='string'?json.data.bodyJson:undefined}:null;
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

    const received:unknown=await res.json();
    if(!object(received)||!object(received.data)||typeof received.data.referenceCode!=='string'||!received.data.referenceCode){return {success:false,message:'Chưa nhận được xác nhận lưu yêu cầu. Vui lòng thử lại.'};}
    return {success:true,message:'Yêu cầu của bạn đã được ghi nhận.'};
  } catch {
    // A network failure must never be presented as a saved lead.
    return {
      success: false,
      message: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp.',
    };
  }
}

export async function getSolutions(): Promise<DetailedSolution[]> {
  try {
    const res = await publicFetch(`${API_BASE_URL}/public/solutions`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend solutions unavailable, using fallback:', err);
  }
  const { fallbackSolutions } = await import('./mockData');
  return fallbackSolutions;
}

export async function getSolutionBySlug(slug: string): Promise<DetailedSolution | null> {
  try {
    const res = await publicFetch(`${API_BASE_URL}/public/solutions/${encodeURIComponent(slug)}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend solution by slug unavailable, using fallback:', err);
  }
  const { fallbackSolutions } = await import('./mockData');
  return (
    fallbackSolutions.find(
      (s) =>
        s.slug === slug ||
        (slug === 'household' && s.slug === 'ho-gia-dinh') ||
        (slug === 'business' && s.slug === 'doanh-nghiep') ||
        (slug === 'industrial' && s.slug === 'nha-xuong-cong-nghiep')
    ) || null
  );
}

export async function getPublicContactChannels(): Promise<ContactChannelItem[]> {
  try {
    const res = await publicFetch(`${API_BASE_URL}/public/contact-channels`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 30 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend contact channels unavailable:', err);
  }
  return [];
}

export async function fetchAdminContactChannels(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/contact-channels`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch contact channels: ${res.status}`);
  return res.json();
}

export async function createAdminContactChannel(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/contact-channels`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create contact channel: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function updateAdminContactChannel(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/contact-channels/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update contact channel: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function deleteAdminContactChannel(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/contact-channels/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete contact channel: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function fetchAdminSolutions(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/solutions`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch solutions: ${res.status}`);
  return res.json();
}

export async function createAdminSolution(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/solutions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create solution: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function updateAdminSolution(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/solutions/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update solution: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function deleteAdminSolution(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/solutions/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete solution: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

// ---------------- Products Admin API ----------------
export async function fetchAdminProducts(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/products?pageSize=100`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function createAdminProduct(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    categoryId: data.categoryId || data.category?.id || '01M6RVG7W2G5C8TNNWWAEKY0BV',
    brandId: data.brandId || data.brand?.id || undefined,
    summary: data.summary || data.description || '',
    description: data.description || data.summary || '',
  };
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create product: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function updateAdminProduct(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    categoryId: data.categoryId || data.category?.id || '01M6RVG7W2G5C8TNNWWAEKY0BV',
    brandId: data.brandId || data.brand?.id || undefined,
    summary: data.summary || data.description || '',
    description: data.description || data.summary || '',
  };
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update product: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function deleteAdminProduct(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete product: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function togglePublishAdminProduct(id: string, publish: boolean, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const action = publish ? 'publish' : 'unpublish';
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}/${action}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to ${action} product: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

// ---------------- Projects Admin API ----------------
export async function fetchAdminProjects(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/projects?pageSize=100`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
  return res.json();
}

export async function createAdminProject(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    projectTypeId: data.projectTypeId || data.projectType?.id || '01M6RVG7Y1QMXE5M0V1T14Y1PQ',
    provinceId: data.provinceId || data.province?.id || '01M6RVG7XNEKEJDN02EKKC8255',
    summary: data.summary || data.title || '',
  };
  const res = await fetch(`${API_BASE_URL}/admin/projects`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function updateAdminProject(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    projectTypeId: data.projectTypeId || data.projectType?.id || '01M6RVG7Y1QMXE5M0V1T14Y1PQ',
    provinceId: data.provinceId || data.province?.id || '01M6RVG7XNEKEJDN02EKKC8255',
    summary: data.summary || data.title || '',
  };
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function deleteAdminProject(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function togglePublishAdminProject(id: string, publish: boolean, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const action = publish ? 'publish' : 'unpublish';
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}/${action}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to ${action} project: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

// ---------------- Articles Admin API ----------------
export async function fetchAdminArticles(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/articles?pageSize=100`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  return res.json();
}

export async function createAdminArticle(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    excerpt: data.excerpt || data.title || '',
    bodyJson: data.bodyJson || JSON.stringify({ content: data.excerpt || data.title }),
  };
  const res = await fetch(`${API_BASE_URL}/admin/articles`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create article: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function updateAdminArticle(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const payload = {
    ...data,
    excerpt: data.excerpt || data.title || '',
    bodyJson: data.bodyJson || JSON.stringify({ content: data.excerpt || data.title }),
  };
  const res = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update article: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function deleteAdminArticle(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete article: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function togglePublishAdminArticle(id: string, publish: boolean, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const action = publish ? 'publish' : 'unpublish';
  const res = await fetch(`${API_BASE_URL}/admin/articles/${id}/${action}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to ${action} article: ${res.status}`);
  return res.json();
}

// ---------------- Branches Admin API ----------------
export async function fetchAdminBranches(token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/branches`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch branches: ${res.status}`);
  return res.json();
}

export async function createAdminBranch(data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/branches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create branch: ${res.status}`);
  return res.json();
}

export async function updateAdminBranch(id: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/branches/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update branch: ${res.status}`);
  return res.json();
}

export async function deleteAdminBranch(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/branches/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete branch: ${res.status}`);
  return res.json();
}

export async function bulkAdminBranches(
  data: { action: string; ids?: string[]; isActive?: boolean },
  token?: string
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/branches/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to execute bulk action on branches: ${res.status}`);
  return res.json();
}

// ---------------- Bulk Contact Channels API ----------------
export async function bulkAdminContactChannels(
  data: { action: string; ids?: string[]; enabled?: boolean },
  token?: string
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}/admin/contact-channels/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to execute bulk action on contact channels: ${res.status}`);
  invalidatePublicCache();
  return res.json();
}

export async function getFaqs() {
  const { fallbackFaqs } = await import('./mockData');
  return fallbackFaqs;
}


export async function getProductCategories(): Promise<ProductCategoryItem[]> {
  const cacheKey = 'meta:product-categories';
  const generation=cacheGeneration;
  const cached = getCached<ProductCategoryItem[]>(cacheKey);
  if (cached) return cached;

  const res = await publicFetch(`${API_BASE_URL}/public/product-categories`, {
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
  });
  if (!res.ok) throw new Error(`Product categories unavailable: ${res.status}`);
  const json: unknown = await res.json();
  const result: ProductCategoryItem[] = object(json) ? items(json.data, category) || [] : [];
  if (result.length > 0) setCached(cacheKey, result, CACHE_TTL_MS, generation);
  return result;
}

export async function getAudiences(): Promise<AudienceItem[]> {
  const cacheKey = 'meta:audiences';
  const generation=cacheGeneration;
  const cached = getCached<AudienceItem[]>(cacheKey);
  if (cached) return cached;

  const res = await publicFetch(`${API_BASE_URL}/public/audiences`, {
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
  });
  if (!res.ok) throw new Error(`Audiences unavailable: ${res.status}`);
  const json: unknown = await res.json();
  const result: AudienceItem[] = object(json) ? items(json.data, audience) || [] : [];
  if (result.length > 0) setCached(cacheKey, result, CACHE_TTL_MS, generation);
  return result;
}

export async function getBrands(): Promise<BrandSummary[]> {
  const cacheKey = 'meta:brands';
  const generation=cacheGeneration;
  const cached = getCached<BrandSummary[]>(cacheKey);
  if (cached) return cached;

  const res = await publicFetch(`${API_BASE_URL}/public/brands`, {
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
  });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  if (!object(json) || !Array.isArray(json.data)) return [];
  const brands = json.data.flatMap((row) =>
    object(row) && typeof row.id === 'string' && typeof row.slug === 'string' && typeof row.name === 'string'
      ? [{ id: row.id, slug: row.slug, name: row.name, logoUrl: typeof row.logoUrl === 'string' ? row.logoUrl : undefined }]
      : []
  );
  const result: BrandSummary[] = Array.from(new Map(brands.map((brand) => [brand.name.toLowerCase(), brand])).values());
  if (result.length > 0) setCached(cacheKey, result, CACHE_TTL_MS, generation);
  return result;
}

async function filterOptions(path: string, valueKey: string, labelKey: string): Promise<{ value: string; label: string }[]> {
  const cacheKey = `filter:${path}:${valueKey}:${labelKey}`;
  const generation=cacheGeneration;
  const cached = getCached<{ value: string; label: string }[]>(cacheKey);
  if (cached) return cached;

  const res = await publicFetch(`${API_BASE_URL}/public/${path}`, {
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
  });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  if (!object(json) || !Array.isArray(json.data)) return [];
  const result = json.data.flatMap((row) => {
    if (!object(row)) return [];
    const value = row[valueKey],
      label = row[labelKey];
    return typeof value === 'string' && typeof label === 'string' ? [{ value, label }] : [];
  });
  if (result.length > 0) setCached(cacheKey, result, CACHE_TTL_MS, generation);
  return result;
}

export function getProjectTypes(): Promise<{ value: string; label: string }[]> {
  return filterOptions('project-types', 'slug', 'name');
}

export function getProvinces(): Promise<{ value: string; label: string }[]> {
  return filterOptions('provinces', 'code', 'name');
}

export function getArticleTags(): Promise<{ value: string; label: string }[]> {
  return filterOptions('tags', 'slug', 'displayName');
}
