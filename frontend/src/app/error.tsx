'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly
    console.error('Next.js Page Error:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-surface">
      <div className="max-w-md space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-ink">Đã Xảy Ra Lỗi Xử Lý</h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Hệ thống gặp sự cố tạm thời khi tải dữ liệu trang. Quý khách vui lòng thử lại hoặc tải lại trang.
        </p>
        <div className="pt-2">
          <Button
            variant="orange"
            size="md"
            onClick={() => reset()}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Thử Lại Ngay
          </Button>
        </div>
      </div>
    </div>
  );
}

