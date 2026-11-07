export type Locale = 'vi' | 'en';

export const LOCALES: readonly Locale[] = ['vi', 'en'];

export const DEFAULT_LOCALE: Locale = 'vi';

export interface LocaleConfig {
  code: Locale;
  label: string;
  flag: string;
  bcp47: string;
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  vi: {
    code: 'vi',
    label: 'Tiếng Việt',
    flag: '🇻🇳',
    bcp47: 'vi-VN',
  },
  en: {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    bcp47: 'en-US',
  },
};

