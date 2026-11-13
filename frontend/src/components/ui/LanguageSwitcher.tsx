'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { LOCALES, LOCALE_CONFIGS, Locale } from '@/lib/i18n/locales';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'topbar' | 'drawer' | 'compact';
  className?: string;
}

export function LanguageSwitcher({
  variant = 'topbar',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale, isEnglish } = useTranslation();


  if (variant === 'topbar') {
    return (
      <div
        className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded transition-colors ${className}`}
        role="group"
        aria-label={isEnglish ? "Choose display language" : "Chọn ngôn ngữ hiển thị"}
      >
        <Globe className="w-3.5 h-3.5 text-accent-orange shrink-0" />
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setLocale('vi')}
            className={`transition-colors px-1 py-0.5 rounded ${
              locale === 'vi'
                ? 'text-white font-bold bg-white/20'
                : 'text-white/70 hover:text-white'
            }`}
            aria-pressed={locale === 'vi'}
            title="Tiếng Việt" aria-label="Tiếng Việt"
          >
            🇻🇳 VN
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={() => setLocale('en')}
            className={`transition-colors px-1 py-0.5 rounded ${
              locale === 'en'
                ? 'text-white font-bold bg-white/20'
                : 'text-white/70 hover:text-white'
            }`}
            aria-pressed={locale === 'en'}
            title="English" aria-label="English"
          >
            🇬🇧 EN
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-2 gap-2">
          {LOCALES.map((code: Locale) => {
            const config = LOCALE_CONFIGS[code];
            const isActive = locale === code;
            return (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isActive
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.flag}</span>
                  <span>{config.label}</span>
                </div>
                {isActive && <Check className="w-4 h-4 text-brand-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact variant (toggle button)
  return (
    <button
      onClick={toggleLocale}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-primary text-xs font-medium text-slate-700 hover:text-brand-primary transition-colors ${className}`}
      aria-label="Đổi ngôn ngữ hiển thị"
      title={isEnglish ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
    >
      <span className="text-sm">{LOCALE_CONFIGS[locale].flag}</span>
      <span className="uppercase font-semibold">{locale}</span>
    </button>
  );
}

