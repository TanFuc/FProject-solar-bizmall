import React from 'react';
import { FullscreenLoader } from '@/components/ui/FullscreenLoader';

/**
 * Root Next.js route loading segment fallback for BM SOLAR.
 * Displays the 100% faithful branded fullscreen loading screen matching design specification.
 */
export default function Loading() {
  return (
    <FullscreenLoader
      id="bm-page-loading"
      portal={true}
      label="Đang tải trải nghiệm năng lượng xanh..."
      sublabel="BM SOLAR  •  Xin vui lòng chờ trong giây lát"
    />
  );
}
