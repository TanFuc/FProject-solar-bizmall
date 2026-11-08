'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { startNavigation, useNavigationPending } from './navigationState';

interface Option {
  value: string;
  label: string;
}

interface AutoSubmitSelectProps {
  name: string;
  value: string;
  label: string;
  options: Option[];
  className?: string;
}

/**
 * Filter/Sort select component that transitions query parameters client-side
 * using scroll=false to preserve scroll position and layout stability.
 * Emits true pending signal via startNavigation() and useTransition.
 */
export function AutoSubmitSelect({
  name,
  value,
  label,
  options,
  className,
}: AutoSubmitSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const isGlobalPending = useNavigationPending();
  const [currentValue, setCurrentValue] = useState(value);

  // Sync state if URL prop changes externally
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);

    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (newValue) {
      params.set(name, newValue);
    } else {
      params.delete(name);
    }

    // Reset pagination to first page when filter/sort changes
    if (name !== 'page') {
      params.delete('page');
    }

    const targetUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    // Signal navigation pending state immediately before transition begins (inline filter change, no fullscreen overlay)
    startNavigation(false);

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <select
        aria-label={label}
        name={name}
        value={currentValue}
        onChange={handleChange}
        aria-busy={isGlobalPending}
        disabled={isGlobalPending}
        className={`transition-opacity duration-150 ${
          isGlobalPending ? 'opacity-70 cursor-wait' : 'cursor-pointer'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isGlobalPending && (
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          Đang cập nhật danh sách...
        </span>
      )}
    </div>
  );
}
