'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

type Listener = () => void;

let isNavigatingState = false;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function startNavigation() {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
  isNavigatingState = true;
  notify();

  // Bounded recovery: auto-clear after 8 seconds if navigation aborted or fails silently
  recoveryTimer = setTimeout(() => {
    finishNavigation();
  }, 8000);
}

export function finishNavigation() {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
  if (isNavigatingState) {
    isNavigatingState = false;
    notify();
  }
}

export function getNavigationState() {
  return isNavigatingState;
}

export function subscribeNavigation(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hook to consume active navigation pending state
 */
export function useNavigationPending(): boolean {
  return useSyncExternalStore(
    subscribeNavigation,
    getNavigationState,
    () => false
  );
}

/**
 * Intercepts user link clicks on same-origin internal links before navigation begins,
 * setting the active pending state truthfully without arbitrary timeouts.
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
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    // Ignore same-page hash jumps
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return;
    }

    // Start navigation pending state before the router takes over
    startNavigation();
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
