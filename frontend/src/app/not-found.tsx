import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function NotFound(){
 return <section className="solar-container py-20 text-center"><p className="text-sm text-slate-500 mb-4">404</p><h1 className="text-3xl font-bold text-brand-primary mb-5">Không tìm thấy trang</h1><p className="text-sm text-slate-600 mb-8">Nội dung có thể đã thay đổi địa chỉ hoặc chưa được xuất bản.</p><Link href="/" className="solar-orange-button"><ArrowLeft size={16}/>Về trang chủ</Link></section>;
}
