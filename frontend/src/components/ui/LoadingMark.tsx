import React from 'react';

interface LoadingMarkProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function LoadingMark({ size = 56, className = '', showText = false }: LoadingMarkProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div aria-hidden="true" className="relative flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          width={size}
          height={size}
          className="select-none"
        >
          <style>{`
            @keyframes bmsolar-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .bmsolar-spinner {
              transform-origin: 64px 64px;
              animation: bmsolar-spin 1.2s linear infinite;
            }
          `}</style>
          <g className="bmsolar-spinner" fill="none" strokeLinecap="round" strokeWidth="6">
            <circle cx="64" cy="64" r="54" stroke="#DCE9F7" strokeDasharray="5 9" />
            <path d="M64 10 A54 54 0 0 1 114 44" stroke="#FF6B0B" />
            <path d="M17 90 A54 54 0 0 1 10 64" stroke="#0D4EA6" />
          </g>
          <g transform="translate(38,44)">
            <path d="M0 0h17q13 0 13 13 0 8-8 11 9 2 9 11 0 14-14 14H0z" fill="#0D4EA6" />
            <path d="M8 31 25 12l14 15 14-15v37H40V31L27 44 17 33 8 43z" fill="#FF6B0B" />
          </g>
        </svg>
      </div>
      {showText && (
        <p className="text-xs font-semibold text-[#0B3A78] tracking-wide animate-pulse">
          Đang tải dữ liệu BM SOLAR...
        </p>
      )}
    </div>
  );
}
