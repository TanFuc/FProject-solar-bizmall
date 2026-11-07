'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Search, Settings, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface ProcessFiveStepsProps {
  tag?: string;
  title?: string;
  rightLinkText?: string;
  rightLinkHref?: string;
}

export function ProcessFiveSteps({
  tag = '02 / NĂNG LỰC TRIỂN KHAI',
  title = 'Mỗi dự án — Một giải pháp phù hợp',
  rightLinkText = 'Xem quy trình →',
  rightLinkHref = '/giai-phap#quy-trinh',
}: ProcessFiveStepsProps) {
  const steps = [
    {
      num: '01',
      icon: MessageSquare,
      name: 'Tư vấn',
      desc: 'Tiếp nhận mục tiêu',
    },
    {
      num: '02',
      icon: Search,
      name: 'Khảo sát',
      desc: 'Đánh giá hiện trạng',
    },
    {
      num: '03',
      icon: Settings,
      name: 'Thiết kế',
      desc: 'Lựa chọn cấu hình',
    },
    {
      num: '04',
      icon: Zap,
      name: 'Thi công',
      desc: 'Triển khai an toàn',
    },
    {
      num: '05',
      icon: ShieldCheck,
      name: 'Hậu mãi',
      desc: 'Đồng hành sử dụng',
    },
  ];

  return (
    <section className="bg-[#0B3A78] text-white py-16 lg:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider mb-2">
              {tag}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href={rightLinkHref}
            className="text-xs font-semibold text-white/80 hover:text-accent-orange flex items-center gap-1 transition-colors group"
          >
            <span>{rightLinkText}</span>
          </Link>
        </div>

        {/* 5 Step Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group backdrop-blur-xs min-h-[140px]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0B3A78] flex items-center justify-center font-bold shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-white/60 font-mono">
                    {st.num}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-white">{st.name}</h4>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-snug">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

