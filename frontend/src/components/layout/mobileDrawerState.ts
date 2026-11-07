'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Global single-instance event controller for the mobile navigation drawer.
 * Prevents multiple simultaneous drawers being mounted or opened concurrently
 * across Header and MobileBottomNav.
 */
const DRAWER_EVENT = 'bmsolar:toggle-mobile-drawer';

interface DrawerEventDetail {
  open?: boolean;
}

export function openMobileDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<DrawerEventDetail>(DRAWER_EVENT, { detail: { open: true } }));
  }
}

export function closeMobileDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<DrawerEventDetail>(DRAWER_EVENT, { detail: { open: false } }));
  }
}

export function toggleMobileDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<DrawerEventDetail>(DRAWER_EVENT, { detail: {} }));
  }
}

export function useMobileDrawerState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  useEffect(() => {
    const handleDrawerEvent = (e: Event) => {
      const customEvent = e as CustomEvent<DrawerEventDetail>;
      if (customEvent.detail && typeof customEvent.detail.open === 'boolean') {
        setIsOpen(customEvent.detail.open);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener(DRAWER_EVENT, handleDrawerEvent);
    return () => {
      window.removeEventListener(DRAWER_EVENT, handleDrawerEvent);
    };
  }, []);

  const open = useCallback(() => openMobileDrawer(), []);
  const close = useCallback(() => closeMobileDrawer(), []);

  return { isOpen, open, close, setIsOpen };
}
