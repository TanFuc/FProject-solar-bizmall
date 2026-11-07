'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  useNavigationPending,
  finishNavigation,
  setupNavigationClickListener,
} from './navigationState';

/**
 * Accessible global route navigation progress indicator.
 * Mounts in Header. Starts immediately on same-origin link clicks or
 * programmatic filter transitions, and finishes truthfully when destination
 * pathname and searchParams commit.
 * Uses indeterminate progress rather than artificial step percentages.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPending = useNavigationPending();
  const isInitialMount = useRef(true);

  // Initialize global click capture for same-origin internal navigations
  useEffect(() => {
    const cleanup = setupNavigationClickListener();
    return cleanup;
  }, []);

  // When pathname or searchParams commit in Next.js, finish navigation state truthfully
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    finishNavigation();
  }, [pathname, searchParams]);

  if (!isPending) return null;

  return (
    <div
      role="progressbar"
      aria-label="Đang tải dữ liệu trang"
      aria-busy="true"
      className="absolute top-0 left-0 right-0 h-[3px] z-50 overflow-hidden pointer-events-none bg-slate-100/30"
    >
      {/* Indeterminate animated progress bar with reduced-motion fallback */}
      <div className="solar-indeterminate-progress h-full bg-gradient-to-r from-accent-orange via-amber-400 to-brand-primary" />
    </div>
  );
}
