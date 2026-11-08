'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  registerLoader,
  unregisterLoader,
  isLoaderPermitted,
  subscribeLoaderCoordinator,
} from './loaderCoordinator';

export interface FullscreenLoaderProps {
  /** Unique identifier for deduplication across concurrent loaders */
  id?: string;
  /** Primary readable status label */
  label?: string;
  /** Secondary subtitle / brand context */
  sublabel?: string;
  /** Whether to portal the overlay into document.body to break stacking context (default: true) */
  portal?: boolean;
  /** Custom additional CSS class for root overlay */
  className?: string;
  /** Callback fired if bounded timeout or escape key releases the loader */
  onDismiss?: () => void;
}

/**
 * 100% Faithful Branded Fullscreen Loading Screen for BM SOLAR.
 * Matches `BM_SOLAR_loading_screen_desktop.png` and `BM_SOLAR_loading_screen_mobile.png`:
 * - Deep navy top bar (#0B356E)
 * - Clean light canvas background (#F6F9FD)
 * - Genuine animated BM SOLAR rotating ring monogram spinner (/images/BM_SOLAR_loading_icon.gif)
 * - High-contrast navy status heading: "Đang tải trải nghiệm năng lượng xanh..."
 * - Slate brand subtitle: "BM SOLAR  •  Xin vui lòng chờ trong giây lát"
 * - Rounded horizontal progress bar (#DCE5EF track with #FF6B0B sliding indicator)
 * - Fully accessible (role="status", aria-live="polite", keyboard Escape dismissal, prefers-reduced-motion support)
 */
export function FullscreenLoader({
  id = 'bm-fullscreen-loader',
  label = 'Đang tải trải nghiệm năng lượng xanh...',
  sublabel = 'BM SOLAR  •  Xin vui lòng chờ trong giây lát',
  portal = true,
  className = '',
  onDismiss,
}: FullscreenLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isPermitted, setIsPermitted] = useState(true);
  const scrollLockApplied = useRef(false);

  useEffect(() => {
    setMounted(true);

    // Coordinate with other loaders to avoid double overlays
    const permitted = registerLoader(id);
    setIsPermitted(permitted);

    const unsubscribe = subscribeLoaderCoordinator(() => {
      setIsPermitted(isLoaderPermitted(id));
    });

    // Clean scroll-lock on document.body
    if (typeof document !== 'undefined' && permitted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      scrollLockApplied.current = true;

      // Graceful bounded safety threshold (8s) so visitors are never trapped
      const safetyTimer = setTimeout(() => {
        if (scrollLockApplied.current) {
          document.body.style.overflow = originalOverflow;
          scrollLockApplied.current = false;
        }
        unregisterLoader(id);
        onDismiss?.();
      }, 8000);

      // Keyboard escape release
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (scrollLockApplied.current) {
            document.body.style.overflow = originalOverflow;
            scrollLockApplied.current = false;
          }
          unregisterLoader(id);
          onDismiss?.();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(safetyTimer);
        window.removeEventListener('keydown', handleKeyDown);
        if (scrollLockApplied.current) {
          document.body.style.overflow = originalOverflow;
          scrollLockApplied.current = false;
        }
        unregisterLoader(id);
        unsubscribe();
      };
    }

    return () => {
      unregisterLoader(id);
      unsubscribe();
    };
  }, [id, onDismiss]);

  // If another loader currently owns the viewport overlay, suppress duplicate rendering
  if (mounted && !isPermitted) {
    return null;
  }

  const content = (
    <aside
      id={id}
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-busy="true"
      className={`fixed inset-0 z-[99999] w-screen h-screen flex flex-col bg-[#F6F9FD] text-slate-800 overflow-hidden select-none ${className}`}
      style={{
        margin: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Top Navy Bar matching site TopBar height & brand navy color (#0B356E) */}
      <div className="w-full h-8 sm:h-9 bg-[#0B356E] shrink-0" aria-hidden="true" />

      {/* Main Centered Brand Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8 px-4 text-center">
        {/* Genuine Animated BM SOLAR Spinner (Rotating Dotted Ring + Upright Monogram) */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center select-none pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/BM_SOLAR_loading_icon.gif"
            alt="BM SOLAR"
            width={192}
            height={192}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        {/* Primary Status Heading */}
        <h2 className="mt-7 sm:mt-8 text-xl sm:text-[22px] font-semibold text-[#0D3264] tracking-tight leading-snug">
          {label}
        </h2>

        {/* Secondary Subtitle */}
        {sublabel && (
          <p className="mt-2 text-xs sm:text-[13px] text-[#8BA1B8] tracking-normal font-normal">
            {sublabel}
          </p>
        )}

        {/* Indeterminate Animated Progress Bar */}
        <div
          className="mt-5 w-60 sm:w-64 h-[7px] bg-[#DCE5EF] rounded-full overflow-hidden relative"
          role="progressbar"
          aria-label="Tiến trình tải trang"
        >
          <div
            className="absolute top-0 bottom-0 left-0 w-[35%] bg-[#FF6B0B] rounded-full"
            style={{
              animation: 'bm-loader-progress 1.6s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes bm-loader-progress {
          0% {
            left: 0%;
            width: 35%;
          }
          50% {
            left: 55%;
            width: 45%;
          }
          100% {
            left: 0%;
            width: 35%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-solar-fade-in {
            animation: none !important;
          }
          div[role='progressbar'] > div {
            animation: none !important;
            left: 0% !important;
            width: 50% !important;
          }
        }
      `}</style>
    </aside>
  );

  // During SSR or before client mount, render directly in-tree
  if (!mounted || !portal || typeof document === 'undefined') {
    return content;
  }

  // On client, portal into document.body to break out of any parent stacking contexts
  return createPortal(content, document.body);
}
