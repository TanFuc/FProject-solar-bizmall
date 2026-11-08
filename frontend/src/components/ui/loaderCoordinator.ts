'use client';

/**
 * Global coordinator to ensure only ONE fullscreen loader overlay is visible
 * in the DOM at any given moment.
 *
 * Prevents double overlays when Next.js route fallback (app/loading.tsx),
 * client pending state (RouteProgressBar), or hard-refresh loader (StartupLoader)
 * are concurrently active.
 */

let activeLoaderOwner: string | null = null;
const listeners = new Set<() => void>();

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
 * Attempts to register a loader instance as the active viewport overlay.
 * Returns true if this instance owns the overlay (or if it was already the owner).
 */
export function registerLoader(id: string): boolean {
  if (activeLoaderOwner === null) {
    activeLoaderOwner = id;
    notify();
    return true;
  }
  return activeLoaderOwner === id;
}

/**
 * Releases registration for the specified loader instance.
 */
export function unregisterLoader(id: string) {
  if (activeLoaderOwner === id) {
    activeLoaderOwner = null;
    notify();
  }
}

/**
 * Returns current active loader ID, or null if no loader is registered.
 */
export function getActiveLoaderOwner(): string | null {
  return activeLoaderOwner;
}

/**
 * Checks whether the specified loader is permitted to display.
 */
export function isLoaderPermitted(id: string): boolean {
  return activeLoaderOwner === null || activeLoaderOwner === id;
}

/**
 * Subscribes to loader ownership changes.
 */
export function subscribeLoaderCoordinator(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
