'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { channelUrl } from '@/lib/contacts/channelUrl';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { resolveInternalRoute } from '@/lib/utils/routes';
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
  const {
    brand,
    activeBranch,
    branches,
    setActiveBranchSlug,
    activeHotline,
    activeZalo,
    openConsultationModal,
  } = useBranch();
  const { t, isEnglish } = useTranslation();

  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Synchronize opening and closing with CSS transitions
  useEffect(() => {
    let animTimer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      previousActiveElementRef.current = (document.activeElement as HTMLElement) || null;
      setIsRendered(true);
      // Small tick to trigger slide-in transition
      animTimer = setTimeout(() => {
        setIsAnimating(true);
      }, 16);
    } else if (isRendered) {
      setIsAnimating(false);
      // Wait for exit transition to finish before unmounting from DOM
      animTimer = setTimeout(() => {
        setIsRendered(false);
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      }, 300);
    }
    return () => clearTimeout(animTimer);
  }, [isOpen, isRendered]);

  // Safe scroll lock that preserves and restores previous body styles exactly
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap within drawer
      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto focus close button or first interactive element
      const timer = setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea'
        );
        firstFocusable?.focus();
      }, 50);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isRendered) return null;

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
    <div
      className="fixed inset-0 z-50 lg:hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
    >
      {/* Backdrop with fade transition */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel sliding from the RIGHT */}
      <div
        ref={drawerRef}
        className={`relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto transform transition-transform duration-300 ease-out will-change-transform ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header: Transparent brand logo without white wrapper or mix-blend hacks */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md p-1"
            aria-label={brand?.name || 'BM SOLAR'}
          >
            <Image
              src="/images/logo.png"
              alt={brand?.logo.alt || brand?.name || 'BM SOLAR Logo'}
              width={140}
              height={44}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
            <span className="sr-only">{brand?.name || 'BM SOLAR'}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={t('drawer.close')}
          >
            <X className="w-5 h-5" />
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
                type="button"
                onClick={() => setActiveBranchSlug(b.slug)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                  activeBranch?.slug === b.slug
                    ? 'bg-brand-primary text-white shadow-sm font-semibold'
                    : 'bg-white text-ink hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {b.name}
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
                href={resolveInternalRoute(item.targetRef)}
                onClick={onClose}
                className="flex items-center justify-between py-3 px-2 text-base font-medium text-ink hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
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
                      href={resolveInternalRoute(sub.targetRef)}
                      onClick={onClose}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary group"
                    >
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-primary transition-colors flex items-center justify-between">
                        <span>{sub.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      {sub.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}
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
              openConsultationModal(
                isEnglish ? 'Consultation request from mobile menu' : 'Đăng ký tư vấn từ mobile menu'
              );
            }}
          >
            {t('nav.getQuote')}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {activeHotline && (
              <a
                href={channelUrl(activeHotline)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-primary hover:bg-brand-light transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-accent-orange" />
                <span>{t('mobileNav.call')}</span>
              </a>
            )}

            {activeZalo && (
              <a
                href={channelUrl(activeZalo)}
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

