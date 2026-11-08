'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavigationItemTree } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { resolveInternalRoute } from '@/lib/utils/routes';
import { Menu, ChevronDown, Search } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import { useMobileDrawerState } from './mobileDrawerState';
import { RouteProgressBar } from '@/components/ui/RouteProgressBar';

interface HeaderProps {
  brand?: import('@/types/bmsolar-api').SiteShellData['brand'];
  navigation: NavigationItemTree[];
}

export function Header({ navigation, brand }: HeaderProps) {
  const { isOpen: isDrawerOpen, open: openDrawer, close: closeDrawer } = useMobileDrawerState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openConsultationModal } = useBranch();
  const { t, isEnglish } = useTranslation();
  const pathname = usePathname();

  // Helper to resolve localized navigation label
  const getNavLabel = (item: NavigationItemTree) => {
    if (!isEnglish) return item.label;
    const ref = item.targetRef || '';
    if (ref === '/' || ref === 'home' || ref === 'trang-chu') return t('nav.home');
    if (ref.includes('gioi-thieu') || ref === 'about') return t('nav.about');
    if (ref.includes('giai-phap') || ref === 'solutions') return t('nav.solutions');
    if (ref.includes('san-pham') || ref === 'products') return t('nav.products');
    if (ref.includes('du-an') || ref === 'projects') return t('nav.projects');
    if (ref.includes('tin-tuc') || ref === 'news') return t('nav.news');
    if (ref.includes('lien-he') || ref === 'contact') return t('nav.contact');
    return item.label;
  };

  const isLinkActive = (item: NavigationItemTree) => {
    const route = resolveInternalRoute(item.targetRef);
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <>
      {isSearchOpen && (
        <div
          className="solar-search-overlay"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsSearchOpen(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="solar-search-heading">
            <div>
              <h2 id="solar-search-heading">Tìm kiếm sản phẩm</h2>
              <button
                type="button"
                aria-label="Đóng tìm kiếm"
                onClick={() => setIsSearchOpen(false)}
              >
                ×
              </button>
            </div>
            <form action="/san-pham">
              <label htmlFor="solar-search-query">Tên sản phẩm hoặc mã thiết bị</label>
              <div>
                <input
                  id="solar-search-query"
                  type="search"
                  name="q"
                  required
                  autoFocus
                  maxLength={120}
                />
                <button type="submit">Tìm kiếm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all relative">
        {/* Global Route Navigation Progress Indicator */}
        <RouteProgressBar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo: Clean transparent logo from CMS without white box or duplicate text */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 py-2 group focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md"
            aria-label={brand?.name || 'BM SOLAR'}
          >
            <Image
              src="/images/logo.png"
              alt={brand?.name || 'BM SOLAR'}
              width={160}
              height={48}
              className="h-9 md:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
            {/* Screen-reader only fallback to avoid visual duplicate text alongside the logo image */}
            <span className="sr-only">{brand?.name || 'BM SOLAR'}</span>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navigation.map((item) => {
              const active = isLinkActive(item);
              const href = resolveInternalRoute(item.targetRef);

              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={href}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1 relative ${
                      active
                        ? 'text-accent-orange font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-accent-orange'
                        : 'text-ink hover:text-brand-primary'
                    }`}
                  >
                    <span>{getNavLabel(item)}</span>
                    {item.children && item.children.length > 0 && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Submenu Dropdown */}
                  {item.children && item.children.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 w-80 sm:w-96 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 space-y-1">
                        {item.children.map((sub) => {
                          const subHref = resolveInternalRoute(sub.targetRef);
                          const isSubActive = pathname === subHref;

                          return (
                            <Link
                              key={sub.id}
                              href={subHref}
                              className={`group/sub block px-3.5 py-2.5 rounded-xl transition-all ${
                                isSubActive
                                  ? 'bg-orange-50/70 border border-orange-200/60'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs sm:text-sm font-bold ${
                                    isSubActive
                                      ? 'text-[#FF6B19]'
                                      : 'text-slate-900 group-hover/sub:text-brand-primary'
                                  }`}
                                >
                                  {sub.label}
                                </span>
                                <span className="text-[11px] font-semibold text-[#FF6B19] opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  â†’
                                </span>
                              </div>
                              {sub.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                                  {sub.description}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action: Search icon & Orange CTA Pill */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full text-slate-600 hover:text-brand-primary hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Orange Consultation Pill CTA */}
            <button
              type="button"
              onClick={() => openConsultationModal('Yêu cầu tư vấn từ Header')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold tracking-wide shadow-md shadow-accent-orange/25 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent-orange"
            >
              <span>{isEnglish ? 'Request Quote' : 'Yêu cầu tư vấn'}</span>
              <span className="text-base font-normal leading-none">+</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={openDrawer}
              className="lg:hidden p-2 rounded-lg text-ink hover:text-brand-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
              aria-label="Mở menu điều hướng"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer (Single global instance) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
      />
    </>
  );
}
