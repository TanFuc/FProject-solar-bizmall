'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavigationItemTree } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { Menu, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MobileDrawer } from './MobileDrawer';

interface HeaderProps {
  navigation: NavigationItemTree[];
}

export function Header({ navigation }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { openConsultationModal } = useBranch();
  const { t, isEnglish } = useTranslation();

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 py-2 group">
            <Image
              src="/images/logo.png"
              alt="BM SOLAR — Tổng Thầu EPC Điện Mặt Trời"
              width={160}
              height={52}
              className="h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-102"
              priority
            />
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navigation.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.targetRef || '#'}
                  className="px-3 py-2 text-sm font-semibold text-ink hover:text-brand-primary flex items-center gap-1 rounded-md transition-colors"
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
                          href={sub.targetRef || '#'}
                          className="block px-3 py-2.5 text-xs md:text-sm font-medium text-ink hover:text-brand-primary hover:bg-surface rounded-lg transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action: Orange Consultation CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Button
              variant="orange"
              size="md"
              className="hidden sm:inline-flex shadow-cta"
              icon={<Sparkles className="w-4 h-4 text-white" />}
              onClick={() => openConsultationModal('Yêu cầu báo giá từ Header')}
            >
              {t('nav.getQuote')}
            </Button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink hover:text-brand-primary hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />
    </>
  );
}

