import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Trị BM SOLAR — Admin Portal',
  description: 'Cổng quản lý Leads, Danh mục thiết bị và CMS BM SOLAR',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="admin-route-nav" aria-label="Quản trị">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/media">Ảnh & nội dung</Link>
      </nav>
      {children}
    </>
  );
}
