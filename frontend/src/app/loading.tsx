'use client';

import { FullscreenLoader } from '@/components/ui/FullscreenLoader';
import { useLoadingLanguage } from '@/lib/i18n/i18nContext';

export default function Loading() {
  const language = useLoadingLanguage();
  if (!language) return null;

  return <FullscreenLoader id="bm-page-loading"
    label={language === 'en' ? 'Loading BM SOLAR…' : 'Đang tải BM SOLAR…'}
    sublabel={language === 'en' ? 'Please wait a moment' : 'Xin vui lòng chờ trong giây lát'} />;
}
