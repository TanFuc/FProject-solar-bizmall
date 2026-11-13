'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FullscreenLoader } from './FullscreenLoader';
import { registerLoader, unregisterLoader } from './loaderCoordinator';

const STARTUP_LOADER_ID = 'bm-startup-loader';

/**
 * Branded startup loader displayed on hard refresh (F5) or initial page entry.
 *
 * Requirements:
 * - Shows immediately on initial load covering the full viewport (z-[99999]).
 * - Dismisses truthfully upon critical readiness (document load/hydration) without artificial delays.
 * - Minimum brief display (350ms) ensures smooth branded transition rather than jarring flash.
 * - Bounded release path (max 2.5s) ensures visitors are never trapped by stalled resources.
 * - Supports no-JS visitors cleanly via noscript CSS override.
 */
export function StartupLoader({ english = false }: { english?: boolean }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFading(true);

    // Fade out duration matches CSS transition
    setTimeout(() => {
      setVisible(false);
      unregisterLoader(STARTUP_LOADER_ID);
    }, 280);
  }, []);

  useEffect(() => {
    // Attempt registration
    registerLoader(STARTUP_LOADER_ID);

    // Give a smooth minimum visual moment (400ms) so users see the branded loading screen
    // before cleanly fading out into the hydrated application
    const minTimer = setTimeout(() => {
      if (document.readyState === 'complete') {
        dismiss();
      } else {
        window.addEventListener('load', () => dismiss(), { once: true });
      }
    }, 450);

    // Safety fallback: auto-dismiss after 2.5s max to prevent trapping visitors
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 2500);

    // Keyboard escape release
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
      unregisterLoader(STARTUP_LOADER_ID);
    };
  }, [dismiss]);

  if (!visible) return null;

  return (
    <>
      {/* No-JS fallback: hides startup loader immediately so non-JS visitors can read page content */}
      <noscript>
        <style>{`#${STARTUP_LOADER_ID} { display: none !important; }`}</style>
      </noscript>

      <FullscreenLoader
        id={STARTUP_LOADER_ID}
        portal={true}
        className={`transition-opacity duration-300 ease-out ${
          fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        label={english ? "Loading BM SOLAR…" : "Đang tải trải nghiệm năng lượng xanh..."}
        sublabel={english ? "Please wait a moment" : "BM SOLAR  •  Xin vui lòng chờ trong giây lát"}
        onDismiss={dismiss}
      />
    </>
  );
}
