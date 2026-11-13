import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowUpRight, BookOpen, Building2, Package, Sun } from 'lucide-react';
import { getArticles, getProducts, getProjects, getSolutions } from '@/lib/api/client';
import { getCurrentContentLocale } from '@/lib/api/localized-page';
import { mediaSource } from '@/lib/api/content-body';

type Kind = 'products' | 'projects' | 'news' | 'solutions';
type Card = { kind: Kind; href: string; title: string; image?: string; group?: string };

const kinds: Kind[] = ['products', 'projects', 'news', 'solutions'];
const details = {
  products: { path: '/san-pham', vi: 'Sản phẩm', en: 'Products', Icon: Package },
  projects: { path: '/du-an', vi: 'Dự án', en: 'Projects', Icon: Building2 },
  news: { path: '/tin-tuc', vi: 'Tin tức', en: 'News', Icon: BookOpen },
  solutions: { path: '/giai-phap', vi: 'Giải pháp', en: 'Solutions', Icon: Sun },
};

interface Props {
  kind?: Kind;
  slug?: string;
  group?: string;
  preferredSlugs?: string[];
}

async function SuggestedContent({ kind, slug, group, preferredSlugs }: Props) {
  const locale = await getCurrentContentLocale();
  const english = locale === 'en-US';
  const current = kind ? details[kind].path + (slug ? '/' + slug : '') : undefined;
  const path = (type: Kind, slug: string) => details[type].path + '/' + slug;
  const priority = kind ? [kind, ...kinds.filter(type => type !== kind)] : ['projects', 'solutions', 'news', 'products'] as Kind[];
  const load: Record<Kind, () => Promise<Card[]>> = {
    products: async () => (await getProducts({ pageSize: 5, locale, category: kind === 'products' ? group : undefined })).data.map(row => ({
      kind: 'products', href: path('products', row.slug), title: row.name, image: row.coverMediaUrl, group: row.category?.slug,
    })),
    projects: async () => (await getProjects({ pageSize: 5, locale, type: kind === 'projects' ? group : undefined })).data.map(row => ({
      kind: 'projects', href: path('projects', row.slug), title: row.title, image: row.coverMediaUrl, group: row.projectType?.slug,
    })),
    news: async () => (await getArticles({ pageSize: 5, locale })).data.map(row => ({
      kind: 'news', href: path('news', row.slug), title: row.title, image: row.coverMediaUrl, group: row.category,
    })),
    solutions: async () => (await getSolutions(locale, true)).map(row => ({
      kind: 'solutions', href: path('solutions', row.slug), title: row.title, image: row.heroImage,
    })),
  };
  const cards = new Map<string, Card>();
  const add = (items: Card[], max: number) => {
    for (const item of items) {
      if (cards.size >= max) break;
      if (item.href !== current && item.title.trim()) cards.set(item.href, item);
    }
  };
  if (kind) {
    const related = await load[kind]();
    related.sort((a, b) => Number(b.group === group) - Number(a.group === group));
    add(related, preferredSlugs?.length ? 2 : 3);
  }
  if (cards.size < 3) {
    const otherKinds = priority.filter(type => type !== kind).slice(0, 3);
    const other = await Promise.all(otherKinds.map(type => load[type]()));
    for (const items of other) {
      items.sort((a, b) => Number(preferredSlugs?.some(slug => b.href.endsWith('/' + slug))) -
        Number(preferredSlugs?.some(slug => a.href.endsWith('/' + slug))));
    }
    for (let i = 0; i < 3 && cards.size < 3; i++) {
      for (const items of other) add(items.slice(i, i + 1), 3);
    }
  }
  add(priority.map(type => ({
    kind: type, href: details[type].path, title: english ? details[type].en : details[type].vi,
  })), 3);

  const hasSimilar = !!kind && !!slug && [...cards.values()].some(card => card.kind === kind && card.href !== details[kind].path);
  const heading = hasSimilar
    ? english ? 'Related content' : 'Nội dung tương tự'
    : english ? 'Explore more' : 'Khám phá thêm';
  return <section aria-labelledby="suggested-content-title" className="solar-suggestions bg-slate-50 py-9 sm:py-12">
    <div className="solar-container">
      <h2 id="suggested-content-title" className="mb-5 text-2xl font-bold text-brand-navy">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...cards.values()].map(card => {
          const { Icon, en, vi } = details[card.kind];
          const image = mediaSource(card.image);
          return <Link key={card.href} href={card.href + (english ? '?lang=en' : '')}
            className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
            {image ? <img src={image} alt="" loading="lazy" decoding="async" className="aspect-[16/8] w-full bg-slate-100 object-cover" />
              : <div className="grid aspect-[16/8] place-items-center bg-blue-50 text-brand-primary"><Icon size={32} aria-hidden="true" /></div>}
            <div className="flex flex-1 items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold text-brand-primary">{english ? en : vi}</p>
                <h3 className="break-words text-base font-bold leading-snug text-slate-900">{card.title}</h3>
              </div>
              <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-primary" />
            </div>
          </Link>;
        })}
      </div>
    </div>
  </section>;
}

export function ContentSuggestions(props: Props) {
  return <Suspense fallback={null}><SuggestedContent {...props} /></Suspense>;
}
