'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home, PhoneCall } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for telemetry without crashing the UI
    console.error('Next.js Page Error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-surface"
    >
      <div className="max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Không Thể Tải Dữ Liệu Trang
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Hệ thống đang gặp gián đoạn tạm thời khi kết nối với máy chủ dữ liệu BM SOLAR. Quý khách vui lòng thử lại hoặc quay về trang chủ.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              Mã tham chiếu: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="orange"
            size="md"
            onClick={() => reset()}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Thử Lại Ngay
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-ink hover:text-brand-primary hover:border-brand-primary text-xs font-semibold transition-colors w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <PhoneCall className="w-3.5 h-3.5 text-accent-orange" />
          <span>Hỗ trợ kỹ thuật: </span>
          <Link href="/lien-he" className="text-brand-primary font-medium hover:underline">
            Liên hệ ban quản trị
          </Link>
        </div>
      </div>
    </div>
  );
}
