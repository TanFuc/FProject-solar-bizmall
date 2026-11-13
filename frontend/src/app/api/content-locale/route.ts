import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug, getPageBySlug, getProductBySlug, getProjectBySlug, getSolutionBySlug } from '@/lib/api/client';

const cmsKeys = {
  '/': 'home', '/home': 'home', '/trang-chu': 'home', '/gioi-thieu': 'about', '/about': 'about',
  '/giai-phap': 'solutions', '/solutions': 'solutions', '/san-pham': 'products', '/products': 'products',
  '/du-an': 'projects', '/projects': 'projects', '/tin-tuc': 'news', '/news': 'news',
  '/lien-he': 'contact', '/contact': 'contact',
} as const;

const findDetail = {
  'san-pham': getProductBySlug, products: getProductBySlug,
  'du-an': getProjectBySlug, projects: getProjectBySlug,
  'tin-tuc': getArticleBySlug, news: getArticleBySlug,
  'giai-phap': getSolutionBySlug, solutions: getSolutionBySlug,
} as const;

export async function GET(request: NextRequest) {
  const path = (request.nextUrl.searchParams.get('path') || '/').replace(/\/+$/, '') || '/';
  const key = Object.hasOwn(cmsKeys, path) ? cmsKeys[path as keyof typeof cmsKeys] : undefined;
  try {
    if (key) {
      const page = await getPageBySlug(key, 'en-US');
      return NextResponse.json({ hasEnglish: page.locale === 'en-US' });
    }
    const match = path.match(/^\/([a-z-]+)\/([a-z0-9-]+)$/i);
    const kind = match?.[1];
    const slug = match?.[2];
    if (kind && slug && Object.hasOwn(findDetail, kind)) {
      const record = await findDetail[kind as keyof typeof findDetail](slug);
      return NextResponse.json({ hasEnglish: record?.hasEnglish === true });
    }
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith('API error 404:')) {
      return NextResponse.json({ hasEnglish: false }, { status: 503 });
    }
  }
  return NextResponse.json({ hasEnglish: false });
}
