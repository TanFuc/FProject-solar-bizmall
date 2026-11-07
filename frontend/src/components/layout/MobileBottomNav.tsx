'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { NavigationItemTree } from '@/types/bmsolar-api';
import { Home, Phone, MessageCircle, Sparkles, Menu } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

interface MobileBottomNavProps {
  navigation: NavigationItemTree[];
}

export function MobileBottomNav({ navigation }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { activeHotline, activeZalo, openConsultationModal } = useBranch();
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isHome = pathname === '/';

  return (
    <>
      <nav
        aria-label="Thanh điều hướng nhanh trên di động"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Trang chủ */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              isHome ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-brand-primary'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px] leading-tight">{t('mobileNav.home')}</span>
          </Link>

          {/* 2. Gọi ngay */}
          <a
            href={activeHotline?.actionUrl || `tel:${activeHotline?.target || '0932456789'}`}
            className="flex flex-col items-center justify-center h-full text-slate-600 hover:text-accent-orange transition-colors"
          >
            <div className="relative">
              <Phone className="w-5 h-5 text-accent-orange mb-1 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[10px] leading-tight font-medium">{t('mobileNav.call')}</span>
          </a>

          {/* 3. Tư vấn (Nút Nổi Bật Trung Tâm) */}
          <button
            onClick={() => openConsultationModal('Bấm nút Tư Vấn từ Mobile Bottom Bar')}
            className="flex flex-col items-center justify-center -mt-4 group"
            aria-label="Nhận tư vấn báo giá"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-orange to-amber-500 text-white flex items-center justify-center shadow-lg shadow-accent-orange/40 group-active:scale-95 transition-transform border-2 border-white">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-accent-orange mt-1">{t('mobileNav.consult')}</span>
          </button>

          {/* 4. Zalo */}
          <a
            href={activeZalo?.actionUrl || `https://zalo.me/${activeZalo?.target || '0932456789'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center h-full text-slate-600 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-[10px] leading-tight font-medium">{t('mobileNav.zalo')}</span>
          </a>

          {/* 5. Menu */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-brand-primary transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-[10px] leading-tight">{t('mobileNav.menu')}</span>
          </button>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
      />
    </>
  );
}
