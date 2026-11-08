'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  useFullPageNavigationPending,
  finishNavigation,
  setupNavigationClickListener,
} from './navigationState';
import { FullscreenLoader } from './FullscreenLoader';

/**
 * Global route navigation progress takeover for BM SOLAR.
 *
 * Mounts in Header (preserving imports).
 * Listens to truthful pending navigation state and renders the branded fullscreen
 * viewport overlay portaled directly to document.body, escaping Header's
 * backdrop-filter stacking context.
 *
 * Finishes truthfully when destination pathname/searchParams commit.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPending = useFullPageNavigationPending();
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
    <FullscreenLoader
      id="bm-route-loader"
      portal={true}
      label="Đang tải trải nghiệm năng lượng xanh..."
      sublabel="BM SOLAR  •  Xin vui lòng chờ trong giây lát"
    />
  );
}
