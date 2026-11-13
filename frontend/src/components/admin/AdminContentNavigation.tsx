import Link from 'next/link';
import { FileText, Images, LayoutDashboard } from 'lucide-react';

export function AdminContentNavigation({ current, showDashboard = false }: { current?: 'about' | 'media'; showDashboard?: boolean }) {
  const items = [
    ...(showDashboard ? [{ key: 'dashboard', href: '/admin', label: 'Bảng điều khiển', Icon: LayoutDashboard }] : []),
    { key: 'about', href: '/admin/gioi-thieu', label: 'Giới thiệu', Icon: FileText },
    { key: 'media', href: '/admin/media', label: 'Ảnh & nội dung', Icon: Images },
  ];
  return <div className="mb-2 space-y-1">
    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Nội dung website</p>
    {items.map(({ key, href, label, Icon }) => <Link key={key} href={href} aria-current={current === key ? 'page' : undefined}
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 aria-[current=page]:bg-brand-primary aria-[current=page]:text-white">
      <Icon size={16} aria-hidden="true" />{label}
    </Link>)}
  </div>;
}
