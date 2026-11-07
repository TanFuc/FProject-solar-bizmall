import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải thông tin sản phẩm"
      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col p-4 space-y-4"
    >
      <Skeleton className="w-full aspect-[4/3] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-6 w-1/3 rounded" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải bài viết"
      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col p-4 space-y-4"
    >
      <Skeleton className="w-full aspect-[16/9] rounded-xl" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-5 w-4/5 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}

