'use client';

import { flushSync } from "react-dom";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,

  useCallback,
  useMemo,
} from 'react';
import { FullscreenLoader } from '@/components/ui/FullscreenLoader';
import { Locale, DEFAULT_LOCALE, LOCALES } from './locales';
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
  useEffect(() => {
    document.cookie = "BM_LOCALE_TRANSITION=;path=/;max-age=0;SameSite=Lax";
    document.cookie = "NEXT_LOCALE=" + initialLocale + ";path=/;max-age=31536000;SameSite=Lax";
  }, [initialLocale]);
  const locale = initialLocale;
  const [pendingLocale, setPendingLocale] = useState<Locale>();
  const setLocale = useCallback((newLocale: Locale) => {
    if (!LOCALES.includes(newLocale) || newLocale === locale || pendingLocale) return;
    flushSync(() => setPendingLocale(newLocale));

    document.cookie = "BM_LOCALE_TRANSITION=1;path=/;max-age=20;SameSite=Lax";
    document.cookie = "NEXT_LOCALE=" + newLocale + ";path=/;max-age=31536000;SameSite=Lax";
    const url = new URL(window.location.href);
    if (url.pathname === "/" || url.pathname === "/en") {
      url.pathname = newLocale === "en" ? "/en" : "/";
      url.searchParams.delete("lang");
    } else if (newLocale === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    requestAnimationFrame(() => requestAnimationFrame(() => window.location.assign(url)));
  }, [locale, pendingLocale]);

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

  return <I18nContext.Provider value={value}>
    {children}
    {pendingLocale && <FullscreenLoader id="bm-language-loader"
      label={pendingLocale === "en" ? "Loading BM SOLAR…" : "Đang tải BM SOLAR…"}
      sublabel={pendingLocale === "en" ? "Changing language" : "Đang chuyển ngôn ngữ"}
      onDismiss={() => setPendingLocale(undefined)} />}
  </I18nContext.Provider>;
}

export function useLoadingLanguage() {
  return useContext(I18nContext)?.locale;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
