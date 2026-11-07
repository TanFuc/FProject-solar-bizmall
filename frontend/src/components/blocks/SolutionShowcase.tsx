'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AudienceItem } from '@/types/bmsolar-api';
import { useBranch } from '@/lib/contacts/branchContext';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SolutionShowcaseProps {
  audiences?: AudienceItem[];
}

export function SolutionShowcase({ audiences }: SolutionShowcaseProps) {
  const { openConsultationModal } = useBranch();

  if (!audiences || audiences.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-surface" id="giai-phap">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-primary text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Thiết Kế Chuyên Biệt Theo Từng Quy Mô</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
            Giải Pháp Điện Mặt Trời Toàn Diện Cho Mọi Nhu Cầu
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            BM SOLAR tư vấn giải pháp tối ưu hóa bức xạ mặt trời, kết cấu mái và bài toán tài chính hoàn vốn nhanh nhất cho từng đối tượng khách hàng.
          </p>
        </div>

        {/* 3 Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((aud) => (
            <div
              key={aud.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Image & Capacity Badge */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                {aud.imageUrl && (
                  <Image
                    src={aud.imageUrl}
                    alt={aud.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3.5 right-3.5 bg-brand-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Công suất: {aud.capacityRange || 'Đa dạng'}
                </span>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold drop-shadow-md">{aud.label}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {aud.description}
                </p>

                {/* Value list */}
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-ink">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tiết kiệm đến 90% chi phí tiền điện</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Chủ động nguồn điện khi mất lưới EVN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Khảo sát đo đạc 3D mái tận nơi miễn phí</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="orange"
                    size="md"
                    fullWidth
                    onClick={() => openConsultationModal(`Tư vấn giải pháp: ${aud.label}`)}
                  >
                    Nhận Dự Toán Chi Phí
                  </Button>
                  <Link
                    href={`/giai-phap#${aud.code}`}
                    className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-primary hover:bg-slate-50 transition-colors"
                    aria-label={`Xem chi tiết giải pháp ${aud.label}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

