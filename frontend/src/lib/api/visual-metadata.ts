import { getPageVisuals } from './visuals';
import { constructMetadata } from '@/lib/seo/metadata';

export async function visualMetadata(
  key: string,
  path: string,
  options?: { noIndex?: boolean }
) {
  const visual = await getPageVisuals(key);
  return constructMetadata({
    title: visual.page.seo.metaTitle || visual.page.title,
    description: visual.page.seo.metaDescription || visual.hero?.subtitle || '',
    canonicalPath: path,
    ogImage: visual.page.seo.ogImageUrl || visual.hero?.desktopMediaUrl,
    keywords: visual.page.seo.keywords,
    noIndex: options?.noIndex,
  });
}
