import { ArrowRight, Search } from 'lucide-react';

export function ProductSearchForm({ english, query = '', id }: { english: boolean; query?: string; id: string }) {
  const t = (vi: string, en: string) => english ? en : vi;
  return <form action="/san-pham" role="search" className="product-search-form">
    {english && <input type="hidden" name="lang" value="en" />}
    <label htmlFor={id} className="sr-only">{t('Tên sản phẩm hoặc mã thiết bị', 'Product name or SKU')}</label>
    <div className="product-search-field">
      <Search size={20} aria-hidden="true" />
      <input id={id} type="search" name="q" defaultValue={query} maxLength={120}
        placeholder={t('Nhập tên sản phẩm hoặc mã thiết bị', 'Enter a product name or SKU')} />
    </div>
    <button type="submit">{t('Tìm kiếm', 'Search')}<ArrowRight size={16} aria-hidden="true" /></button>
  </form>;
}
