'use client';

import React from 'react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Phone, Mail, MapPin, Clock, ChevronDown } from 'lucide-react';

export function TopBar() {
  const { branches, activeBranch, setActiveBranchSlug, activeHotline } = useBranch();
  const { t } = useTranslation();

  return (
    <aside aria-label="Thông tin liên hệ & chi nhánh" className="bg-brand-dark text-white/90 text-xs hidden lg:block border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        {/* Left: Branch selector & address */}
        <div className="flex items-center gap-6">
          <div className="relative group flex items-center gap-1.5 cursor-pointer py-1">
            <MapPin className="w-3.5 h-3.5 text-accent-orange shrink-0" />
            <span className="font-medium text-white">{activeBranch?.name || t('topbar.branchDefault')}</span>
            <ChevronDown className="w-3 h-3 text-white/60 group-hover:text-white transition-transform group-hover:rotate-180" />

            {/* Branch dropdown */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-brand-darker rounded-lg shadow-xl border border-white/10 p-2 hidden group-hover:block z-50">
              <p className="text-[11px] font-semibold text-white/50 px-2.5 py-1 uppercase tracking-wider">
                {t('topbar.selectBranch')}
              </p>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBranchSlug(b.slug)}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex flex-col gap-0.5 ${
                    activeBranch?.slug === b.slug
                      ? 'bg-brand-primary text-white font-medium'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="font-semibold">{b.name}</span>
                  <span className="text-[11px] text-white/60 truncate">{b.streetAddress}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-white/70">
            <Clock className="w-3.5 h-3.5 text-accent-orange/80 shrink-0" />
            <span>{t('topbar.workingHours')}</span>
          </div>
        </div>

        {/* Right: Direct Hotline & Email + Language Switcher */}
        <div className="flex items-center gap-5">
          {activeHotline && (
            <a
              href={activeHotline.actionUrl || `tel:${activeHotline.target}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors group"
            >
              <Phone className="w-3.5 h-3.5 text-accent-orange group-hover:scale-110 transition-transform" />
              <span>
                {t('topbar.hotline')}: <strong className="text-white font-bold">{activeHotline.formatted || activeHotline.target}</strong>
              </span>
            </a>
          )}

          <a
            href="mailto:kinhdoanh@bmsolar.vn"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-accent-orange/80" />
            <span>kinhdoanh@bmsolar.vn</span>
          </a>

          <div className="flex items-center gap-3 border-l border-white/15 pl-4 text-white/70">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook BM Solar"
            >
              FB
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="YouTube BM Solar"
            >
              YT
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-orange font-bold hover:text-white transition-colors"
              aria-label="Zalo Official"
            >
              Zalo
            </a>
          </div>

          {/* Desktop Language Switcher */}
          <LanguageSwitcher variant="topbar" />
        </div>
      </div>
    </aside>
  );
}

