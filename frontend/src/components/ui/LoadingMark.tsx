import React from 'react';
import Image from 'next/image';

interface LoadingMarkProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function LoadingMark({ size = 48, className = '', showText = false }: LoadingMarkProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        aria-hidden="true"
        className="relative animate-solar-pulse flex items-center justify-center"
      >
        <Image
          src="/images/BM_SOLAR_loading_icon.svg"
          alt="BM SOLAR Loading"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <p className="text-xs font-medium text-ink-muted tracking-wide animate-pulse">
          Đang tải nội dung BM SOLAR...
        </p>
      )}
    </div>
  );
}

