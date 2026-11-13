'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

interface PaginationProps {
  path: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}

export function Pagination({
  path,
  page,
  totalPages,
  params = {},
}: PaginationProps) {
  const { isEnglish } = useTranslation();
  if (totalPages < 2) return null;

  return (
    <nav className="solar-pagination" aria-label={isEnglish ? "Pagination" : "Phân trang"}>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value && key !== 'page') {
            query.set(key, value);
          }
        }
        query.set('page', String(number));

        const isCurrent = number === page;

        return (
          <Link
            key={number}
            href={`${path}?${query.toString()}`}
            scroll={false}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`${isEnglish ? "Page" : "Trang"} ${number}`}
            className={`transition-colors duration-150 ${
              isCurrent ? 'font-bold' : ''
            }`}
          >
            {number}
          </Link>
        );
      })}
    </nav>
  );
}
