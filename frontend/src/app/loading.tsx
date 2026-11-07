import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingMark } from '@/components/ui/LoadingMark';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải dữ liệu trang..."
      className="w-full bg-surface-white"
    >
      {/* Lightweight Inner Hero Skeleton */}
      <div className="relative min-h-[300px] md:min-h-[380px] bg-gradient-to-r from-brand-dark to-brand-primary flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20 rounded" />
          <Skeleton className="h-10 md:h-12 w-2/3 max-w-xl bg-white/20 rounded" />
          <Skeleton className="h-4 w-1/2 max-w-md bg-white/10 rounded" />
          <div className="pt-2 flex gap-3">
            <Skeleton className="h-10 w-36 bg-white/25 rounded-full" />
            <Skeleton className="h-10 w-28 bg-white/15 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Skeleton className="h-7 w-48 rounded" />
          <div className="flex items-center gap-2">
            <LoadingMark size={24} showText={false} />
            <span className="text-xs text-ink-muted">Đang tải nội dung...</span>
          </div>
        </div>

        {/* 3-Column Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 shadow-xs"
            >
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-5 w-4/5 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
