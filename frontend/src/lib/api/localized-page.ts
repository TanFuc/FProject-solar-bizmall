import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { englishLabel } from '@/lib/i18n/site-shell';
import { getPageBySlug, getSiteShell } from './client';

export async function getCurrentContentLocale() {
  const explicit = (await headers()).get('x-bmsolar-language');
  const preferred = explicit || (await cookies()).get('NEXT_LOCALE')?.value;
  return preferred === 'en' ? 'en-US' as const : 'vi-VN' as const;
}

const loadPage = cache(getPageBySlug);

export const getLocalizedPage = cache(async (key: string) => {
  const locale = await getCurrentContentLocale();
  if (locale === 'en-US') {
    try {
      const translated = await loadPage(key, 'en-US');
      return { ...translated, hasEnglish: translated.locale === 'en-US' };
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('API error 404:')) throw error;
    }
  }
  const source = await loadPage(key, 'vi-VN');
  return locale === 'en-US' ? { ...source, locale: 'en-US' as const, hasEnglish: false } : { ...source, hasEnglish: undefined };
});

export async function labelsForLocale(locale: 'vi-VN' | 'en-US') {
  if (locale !== 'en-US') return (value: string) => value;
  const shell = await getSiteShell('en-US');
  return (value: string) => englishLabel(value, shell.englishLabels);
}

export async function pageHasPublishedEnglish(key: string) {
  try { return (await loadPage(key, 'en-US')).locale === 'en-US'; }
  catch { return false; }
}
