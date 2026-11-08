'use client';

import React, { useState, useEffect } from 'react';
import { ContactChannelItem } from '@/types/bmsolar-api';
import { PhoneCall, Mail, ArrowUp, MessageSquare } from 'lucide-react';

interface FloatingSocialDockProps {
  initialChannels?: ContactChannelItem[];
}

export function FloatingSocialDock({ initialChannels = [] }: FloatingSocialDockProps) {
  const [channels, setChannels] = useState<ContactChannelItem[]>(initialChannels);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Client-side refresh to guarantee fresh state when admin updates channels
  useEffect(() => {
    let isMounted = true;
    async function loadFreshChannels() {
      try {
        const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
        const url = `${apiOrigin.endsWith('/api/v1') ? apiOrigin : `${apiOrigin}/api/v1`}/public/contact-channels`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json && Array.isArray(json.data) && json.data.length > 0) {
            setChannels(json.data);
          }
        }
      } catch {
        // Keep initial channels if network fails
      }
    }
    loadFreshChannels();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter only enabled channels
  const activeChannels = channels
    .filter((c) => (c as any).enabled !== false && (c as any).isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (activeChannels.length === 0 && !showBackToTop) {
    return null;
  }

  const renderIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phone':
      case 'hotline':
        return <PhoneCall className="w-5 h-5 text-white animate-wiggle" />;
      case 'zalo':
        return (
          <span className="font-extrabold text-[13px] tracking-tight text-white select-none">
            Zalo
          </span>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'messenger':
        return <MessageSquare className="w-5 h-5 text-white" />;
      case 'email':
        return <Mail className="w-5 h-5 text-white" />;
      default:
        return <PhoneCall className="w-5 h-5 text-white" />;
    }
  };

  const getButtonBg = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phone':
      case 'hotline':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30';
      case 'zalo':
        return 'bg-gradient-to-r from-[#0068FF] to-[#0052cc] shadow-blue-500/30';
      case 'facebook':
        return 'bg-gradient-to-r from-[#1877F2] to-[#0d65d9] shadow-blue-600/30';
      case 'youtube':
        return 'bg-gradient-to-r from-[#FF0000] to-[#cc0000] shadow-red-500/30';
      case 'messenger':
        return 'bg-gradient-to-r from-[#00B2FF] to-[#006AFF] shadow-cyan-500/30';
      case 'email':
        return 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-700/30';
      default:
        return 'bg-gradient-to-r from-[#FF6B19] to-amber-500 shadow-orange-500/30';
    }
  };

  const getActionHref = (type: string, target: string) => {
    if (!target) return '#';
    if (type === 'phone' || type === 'hotline') {
      const clean = target.replace(/[^0-9+]/g, '');
      return `tel:${clean}`;
    }
    if (type === 'email') {
      return `mailto:${target}`;
    }
    if (type === 'zalo') {
      if (target.startsWith('http')) return target;
      const clean = target.replace(/[^0-9]/g, '');
      return `https://zalo.me/${clean}`;
    }
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return target;
    }
    return `https://${target}`;
  };

  return (
    <aside
      aria-label="Kênh liên hệ nhanh và mạng xã hội"
      className="fixed right-3 sm:right-5 bottom-24 sm:bottom-28 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto select-none print:hidden"
    >
      {activeChannels.map((c) => {
        const isPhone = c.type === 'phone' || (c.type as string) === 'hotline';
        const href = getActionHref(c.type, c.target);
        const isExternal = !href.startsWith('tel:') && !href.startsWith('mailto:');

        return (
          <div key={c.id || `${c.type}-${c.target}`} className="group relative flex items-center">
            {/* Tooltip on hover expanding to the left */}
            <span
              className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 hidden sm:inline-block"
              role="tooltip"
            >
              {c.label || c.formatted || c.target}
              {/* Arrow */}
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
            </span>

            {/* Circular Button */}
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              aria-label={c.label || `${c.type}: ${c.target}`}
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg ${getButtonBg(
                c.type
              )} text-white hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B19]`}
            >
              {/* Pulsing Ripple Ring for Phone Call */}
              {isPhone && (
                <>
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
                  <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/50 animate-pulse pointer-events-none" />
                </>
              )}

              {/* Icon */}
              <span className="relative z-10 flex items-center justify-center">
                {renderIcon(c.type)}
              </span>
            </a>
          </div>
        );
      })}

      {/* Back To Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-slate-700 hover:text-brand-primary border border-slate-200/90 shadow-md hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 hidden sm:inline-block">
            Lên đầu trang
          </span>
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <style jsx global>{`
        @keyframes bmsolar-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
        .animate-wiggle {
          animation: bmsolar-wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </aside>
  );
}
