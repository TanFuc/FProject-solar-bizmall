'use client';

import { useSyncExternalStore } from 'react';

type Listener = () => void;

let isNavigatingState = false;
let isFullPageNavigatingState = false;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

/**
 * Initiates navigation pending state.
 * @param isFullPage When true, signals a full cross-route page transition requiring fullscreen takeover.
 *                   When false, signals an inline query/filter transition preserving scroll and layout.
 */
export function startNavigation(isFullPage: boolean = true) {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
  isNavigatingState = true;
  isFullPageNavigatingState = isFullPage;
  notify();

  // Bounded recovery: auto-clear after 8 seconds if navigation aborted or fails silently
  recoveryTimer = setTimeout(() => {
    finishNavigation();
  }, 8000);
}

/**
 * Concludes active navigation state truthfully.
 */
export function finishNavigation() {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
  if (isNavigatingState || isFullPageNavigatingState) {
    isNavigatingState = false;
    isFullPageNavigatingState = false;
    notify();
  }
}

export function getNavigationState() {
  return isNavigatingState;
}

export function getFullPageNavigationState() {
  return isFullPageNavigatingState;
}

export function subscribeNavigation(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hook to consume active navigation pending state (includes both page navigation and inline filtering).
 * Consumed by inline components like CatalogPendingIndicator.
 */
export function useNavigationPending(): boolean {
  return useSyncExternalStore(
    subscribeNavigation,
    getNavigationState,
    () => false
  );
}

/**
 * Hook to consume active full-page route navigation pending state (cross-route page changes only).
 * Consumed by RouteProgressBar to display branded fullscreen overlay without interfering with inline filters.
 */
export function useFullPageNavigationPending(): boolean {
  return useSyncExternalStore(
    subscribeNavigation,
    getFullPageNavigationState,
    () => false
  );
}

/**
 * Intercepts user link clicks on same-origin internal links before navigation begins,
 * setting the active pending state truthfully without arbitrary timeouts.
 * Distinguishes full cross-route transitions from same-page filter/sort/pagination clicks.
 */
export function setupNavigationClickListener() {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    const target = e.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!anchor || !anchor.href) return;

    // Ignore links configured for download or opening in new window/tab
    if (anchor.hasAttribute('download')) return;
    const anchorTarget = anchor.getAttribute('target');
    if (anchorTarget && anchorTarget !== '_self') return;

    // Check same origin
    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;

    // Ignore same-page hash jumps
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return;
    }

    // Determine whether this is a full route change vs same-page filter/sort/pagination
    const isDifferentPage = url.pathname !== window.location.pathname;
    startNavigation(isDifferentPage);
  };

  const handlePopState = () => {
    finishNavigation();
  };

  document.addEventListener('click', handleClick, true);
  window.addEventListener('popstate', handlePopState);

  return () => {
    document.removeEventListener('click', handleClick, true);
    window.removeEventListener('popstate', handlePopState);
  };
}
