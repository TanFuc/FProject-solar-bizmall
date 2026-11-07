/**
 * Route resolution utility for BM SOLAR web platform.
 * Normalizes internal route keys (e.g. 'about', 'solutions', 'san-pham') into canonical Next.js application routes.
 */

export function resolveInternalRoute(ref?: string | null): string {
  if (!ref) return '/';
  const clean = ref.trim();

  // External URLs or protocol schemes
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('tel:') ||
    clean.startsWith('mailto:') ||
    clean.startsWith('#')
  ) {
    return clean;
  }

  // Strip leading and trailing slashes for clean matching
  const normalized = clean.replace(/^\/+/, '').replace(/\/+$/, '');

  switch (normalized) {
    case '':
    case 'home':
    case 'trang-chu':
      return '/';

    case 'about':
    case 'gioi-thieu':
      return '/gioi-thieu';

    case 'solutions':
    case 'giai-phap':
      return '/giai-phap';

    case 'products':
    case 'san-pham':
      return '/san-pham';

    case 'projects':
    case 'du-an':
      return '/du-an';

    case 'news':
    case 'tin-tuc':
      return '/tin-tuc';

    case 'contact':
    case 'lien-he':
      return '/lien-he';

    case 'admin':
      return '/admin';

    default:
      if (normalized.startsWith('solutions/')) return `/giai-phap/${normalized.slice(10)}`;
      if (normalized.startsWith('products/')) return `/san-pham/${normalized.slice(9)}`;
      if (normalized.startsWith('projects/')) return `/du-an/${normalized.slice(9)}`;
      if (normalized.startsWith('news/')) return `/tin-tuc/${normalized.slice(5)}`;
      return `/${normalized}`;
  }
}

