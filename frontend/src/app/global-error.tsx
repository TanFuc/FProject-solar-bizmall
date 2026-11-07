'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical Root Layout Error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <head>
        <title>Sự Cố Kết Nối — BM SOLAR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: '#F5F8FC',
          color: '#12243D',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <main
          role="alert"
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #E2EAF4',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(13, 78, 166, 0.08)',
          }}
        >
          {/* Brand Mark */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FFF4ED',
              color: '#FF6B19',
              marginBottom: '20px',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            ☀️
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 750,
              color: '#0D4EA6',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
            }}
          >
            BM SOLAR — Sự Cố Hệ Thống
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#5A6B82',
              margin: '0 0 24px',
            }}
          >
            Không thể tải cấu hình giao diện chính từ máy chủ. Quý khách vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng.
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#94A3B8',
                margin: '0 0 20px',
              }}
            >
              Mã lỗi: {error.digest}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: '#FF6B19',
                color: '#ffffff',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 28px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 107, 25, 0.3)',
              }}
            >
              Thử Lại Ngay
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              style={{
                backgroundColor: '#ffffff',
                color: '#0D4EA6',
                border: '1px solid #CBD5E1',
                borderRadius: '30px',
                padding: '12px 24px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Về Trang Chủ
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
