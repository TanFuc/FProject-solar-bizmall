import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProductCategoryItem } from '@/types/bmsolar-api';

const icons = {
  panel: <><circle cx="34" cy="12" r="4" /><path d="M34 4v2m0 12v2m-8-8h2m12 0h2m-2.4-5.6-1.4 1.4M15 34l-2 6h18l-2-6M10 22h24l5 12H5l5-12Zm6 0-2 12m14-12 2 12M8 28h28" /></>,
  inverter: <><rect x="11" y="5" width="26" height="36" rx="5" /><path d="M16 11h16v13H16zm1 7c2-5 4-5 7 0s5 5 7 0M19 31h4m4 0h2M17 41v3m14-3v3" /></>,
  battery: <><rect x="5" y="13" width="35" height="23" rx="5" /><path d="M40 21h4v7h-4M13 20v9m14-10-5 6h6l-4 6" /></>,
  charger: <><rect x="9" y="5" width="21" height="36" rx="4" /><path d="M14 11h11v9H14zM15 30h8M30 34h4a5 5 0 0 0 5-5V17m-3-5v5h6v-5m-5 0V8m4 4V8M6 42h27" /></>,
  mounting: <><path d="M6 35h36M11 35l8-18 15 18M17 23l20-10 5 6-20 10m-6-5-6 3m21-7 3 6M12 39h24" /><circle cx="19" cy="17" r="2" /></>,
  other: <><path d="m24 6 16 9v18l-16 9-16-9V15l16-9Zm0 18 16-9m-16 9L8 15m16 9v18m-8-22 16-9" /></>,
};

function categoryIcon(slug: string): keyof typeof icons {
  if (/pin-luu/.test(slug)) return 'battery';
  if (/inverter|bien-tan/.test(slug)) return 'inverter';
  if (/tram-sac/.test(slug)) return 'charger';
  if (/phu-kien/.test(slug)) return 'mounting';
  if (/tam-pin/.test(slug)) return 'panel';
  return 'other';
}

export function CategoryStrip({ categories, english = false, selected }: {
  categories?: ProductCategoryItem[];
  english?: boolean;
  selected?: string;
}) {
  if (!categories?.length) return null;

  return <section className="solar-categories" aria-label={english ? 'Product categories' : 'Danh mục sản phẩm'}>
    {categories.map(category => {
      const icon = categoryIcon(category.slug);
      const params = new URLSearchParams({ category: category.slug });
      if (english) params.set('lang', 'en');
      return <Link key={category.id} href={'/san-pham?' + params} scroll={false}
        aria-current={selected === category.slug ? 'true' : undefined} className="solar-category" data-category-icon={icon}>
        <span className="solar-category-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {icons[icon]}
          </svg>
        </span>
        <h2>{category.name}</h2>
        <ArrowUpRight className="solar-category-arrow" size={17} aria-hidden="true" />
      </Link>;
    })}
  </section>;
}
