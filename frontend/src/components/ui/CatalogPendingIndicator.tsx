'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigationPending } from './navigationState';

/**
 * Client feedback indicator placed near catalog result grids.
 * Consumes the true navigation pending state.
 * Reserves a small stable slot (min-h-[26px], min-w-[130px]) so it does not
 * cause layout shift when transitioning between idle and pending states.
 */
export function CatalogPendingIndicator({ className = '' }: { className?: string }) {
  const isPending = useNavigationPending();

  return (
    <div
      className={`min-h-[26px] min-w-[140px] flex items-center ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {isPending ? (
        <div
          role="status"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-medium"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-orange motion-reduce:animate-none" />
          <span>Đang cập nhật kết quả...</span>
        </div>
      ) : (
        <span className="sr-only">Kết quả đã được cập nhật</span>
      )}
    </div>
  );
}
