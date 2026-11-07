'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavigationItemTree } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { resolveInternalRoute } from '@/lib/utils/routes';
import { Menu, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

interface HeaderProps {
 brand?: import('@/types/bmsolar-api').SiteShellData['brand'];
  navigation: NavigationItemTree[];
}

export function Header({ navigation, brand }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 py-2 group">
            <Image
              src="/images/logo.png"
              alt="BM SOLAR — Tổng Thầu EPC Điện Mặt Trời"
              width={160}
              height={52}
              className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-102"
              priority
            />
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
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-primary transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Submenu Dropdown */}
                  {item.children && item.children.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 space-y-0.5">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={resolveInternalRoute(sub.targetRef)}
                            className="block px-3 py-2.5 text-xs md:text-sm font-medium text-ink hover:text-brand-primary hover:bg-surface rounded-lg transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
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
              onClick={() => openConsultationModal('Tìm kiếm hoặc tư vấn giải pháp')}
              className="p-2.5 rounded-full text-slate-600 hover:text-brand-primary hover:bg-slate-100 transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Orange Consultation Pill CTA */}
            <button
              onClick={() => openConsultationModal('Yêu cầu tư vấn từ Header')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-orange to-amber-500 hover:from-amber-500 hover:to-accent-orange text-white text-xs font-bold tracking-wide shadow-md shadow-accent-orange/25 active:scale-95 transition-all"
            >
              <span>{isEnglish ? 'Request Quote' : 'Yêu cầu tư vấn'}</span>
              <span className="text-base font-normal leading-none">+</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink hover:text-brand-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />
    </>
  );
}
