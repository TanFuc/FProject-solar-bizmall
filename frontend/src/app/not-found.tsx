import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-surface">
      <div className="max-w-md space-y-5">
        <span className="text-6xl font-black text-brand-primary tracking-tight">404</span>
        <h1 className="text-2xl font-bold text-ink">Không Tìm Thấy Trang</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Đường dẫn quý khách truy cập không tồn tại hoặc đã được thay đổi. Vui lòng quay về trang chủ hoặc liên hệ với BM SOLAR để được hỗ trợ.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Button variant="orange" size="md" href="/" icon={<Home className="w-4 h-4" />}>
            Về Trang Chủ
          </Button>
          <Button variant="ghost" size="md" href="/giai-phap" icon={<ArrowLeft className="w-4 h-4" />}>
            Xem Giải Pháp
          </Button>
        </div>
      </div>
    </div>
  );
}

