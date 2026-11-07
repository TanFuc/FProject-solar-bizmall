'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NavigationItemTree } from '@/types/bmsolar-api';
import { X, Phone, MessageCircle, MapPin, ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItemTree[];
}

export function MobileDrawer({ isOpen, onClose, navigation }: MobileDrawerProps) {
  const { activeBranch, branches, setActiveBranchSlug, activeHotline, activeZalo, openConsultationModal } =
    useBranch();
  const { t, isEnglish } = useTranslation();

  if (!isOpen) return null;

  // Helper to resolve localized navigation label
  const getNavLabel = (item: NavigationItemTree) => {
    if (!isEnglish) return item.label;
    const ref = item.targetRef || '';
    if (ref === '/' || ref === 'home') return t('nav.home');
    if (ref.includes('gioi-thieu') || ref === 'about') return t('nav.about');
    if (ref.includes('giai-phap') || ref === 'solutions') return t('nav.solutions');
    if (ref.includes('san-pham') || ref === 'products') return t('nav.products');
    if (ref.includes('du-an') || ref === 'projects') return t('nav.projects');
    if (ref.includes('tin-tuc') || ref === 'news') return t('nav.news');
    if (ref.includes('lien-he') || ref === 'contact') return t('nav.contact');
    return item.label;
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="BM SOLAR"
              width={130}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label={t('drawer.close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Branch Switcher Card */}
        <div className="p-4 bg-surface border-b border-slate-100">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent-orange" />
            {t('drawer.branchTitle')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchSlug(b.slug)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                  activeBranch?.slug === b.slug
                    ? 'bg-brand-primary text-white shadow-sm font-semibold'
                    : 'bg-white text-ink hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {b.code === 'QN-HQ' ? 'TP. Quy Nhơn' : 'TP.HCM (Gò Vấp)'}
              </button>
            ))}
          </div>
        </div>

        {/* Language Switcher Card */}
        <div className="p-4 bg-white border-b border-slate-100">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-primary" />
            {t('drawer.languageTitle')}
          </p>
          <LanguageSwitcher variant="drawer" />
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex-1 space-y-1">
          {navigation.map((item) => (
            <div key={item.id} className="border-b border-slate-50 last:border-none">
              <Link
                href={item.targetRef || '#'}
                onClick={onClose}
                className="flex items-center justify-between py-3 px-2 text-base font-medium text-ink hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span>{getNavLabel(item)}</span>
                {item.children && item.children.length > 0 ? (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                ) : null}
              </Link>

              {/* Sub-items */}
              {item.children && item.children.length > 0 && (
                <div className="pl-4 pb-2 space-y-1">
                  {item.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.targetRef || '#'}
                      onClick={onClose}
                      className="block py-2 px-3 text-sm text-ink-muted hover:text-brand-primary rounded-md transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Quick Contact & Consultation CTA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3 pb-8">
          <Button
            variant="orange"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              openConsultationModal(isEnglish ? 'Consultation request from mobile menu' : 'Đăng ký tư vấn từ mobile menu');
            }}
          >
            {t('nav.getQuote')}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {activeHotline && (
              <a
                href={activeHotline.actionUrl || `tel:${activeHotline.target}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-primary hover:bg-brand-light transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-accent-orange" />
                <span>{t('mobileNav.call')}</span>
              </a>
            )}

            {activeZalo && (
              <a
                href={activeZalo.actionUrl || `https://zalo.me/${activeZalo.target}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Zalo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
