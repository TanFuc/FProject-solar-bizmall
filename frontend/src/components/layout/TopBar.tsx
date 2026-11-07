'use client';
import {channelUrl} from '@/lib/contacts/channelUrl';

import React from 'react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Phone, Mail } from 'lucide-react';

export function TopBar() {
  const { branches, activeBranch, setActiveBranchSlug, activeHotline } = useBranch();
  const { t } = useTranslation();
  const email=activeBranch?.channels.find(channel=>channel.type==='email');

  return (
    <aside
      aria-label="Thông tin liên hệ & chi nhánh"
      className="bg-[#0B2240] text-white/90 text-xs hidden lg:block border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Hệ thống BM SOLAR: [Quy Nhơn] [Gò Vấp - TP.HCM] */}
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs font-medium">Hệ thống BM SOLAR:</span>
          <div className="inline-flex items-center gap-1.5">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchSlug(b.slug)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeBranch?.slug === b.slug
                    ? 'bg-white/20 text-white border border-white/30 shadow-xs'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Direct Hotline, Email & Language Switcher */}
        <div className="flex items-center gap-4 text-xs">
          {activeHotline && (
            <a
              href={channelUrl(activeHotline)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-accent-orange" />
              <span>{activeHotline.formatted || activeHotline.target}</span>
            </a>
          )}

          {email&&<a
            href={channelUrl(email)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-accent-orange/80" />
            <span>{email.target}</span>
          </a>}

          {/* Language Switcher */}
          <div className="flex items-center gap-2.5 border-l border-white/15 pl-3">
            <LanguageSwitcher variant="topbar" />
          </div>
        </div>
      </div>
    </aside>
  );
}
