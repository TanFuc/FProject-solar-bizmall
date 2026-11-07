'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Locale, DEFAULT_LOCALE, LOCALES, LOCALE_CONFIGS } from './locales';
import { vi, TranslationKey } from './dictionaries/vi';
import { en } from './dictionaries/en';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  vi,
  en,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isEnglish: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Initialize from cookie or localStorage on client mount
  useEffect(() => {
    try {
      // 1. Check document.cookie
      const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
      const cookieLocale = match ? (match[1] as Locale) : null;

      if (cookieLocale && LOCALES.includes(cookieLocale)) {
        setLocaleState(cookieLocale);
        return;
      }

      // 2. Check localStorage
      const savedLocale = localStorage.getItem('bm_solar_locale') as Locale | null;
      if (savedLocale && LOCALES.includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);

    try {
      // Persist in localStorage
      localStorage.setItem('bm_solar_locale', newLocale);

      // Persist in cookie (1 year expiry)
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

      // Update html lang attribute dynamically
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] || dictionaries.vi;
      let text = dict[key] || dictionaries.vi[key] || key;

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
      }

      return text;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      isEnglish: locale === 'en',
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
