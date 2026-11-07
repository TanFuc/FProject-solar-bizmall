import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BM SOLAR — Giải Pháp Điện Mặt Trời & Lưu Trữ Năng Lượng',
    short_name: 'BM SOLAR',
    description:
      'Tổng thầu EPC điện mặt trời mái nhà, pin lưu trữ BESS và trạm sạc xe điện uy tín tại TP.HCM và Quy Nhơn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0D4EA6',
    icons: [
      {
        src: '/images/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/images/BM_SOLAR_loading_icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
