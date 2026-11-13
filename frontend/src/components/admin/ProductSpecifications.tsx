'use client';

import { useState } from 'react';

type Row = { name: string; value: unknown };

export function ProductSpecifications({ value, onChange }: { value?: string; onChange: (json: string) => void }) {
  const [rows, setRows] = useState<Row[]>(() => {
    try { return Object.entries(JSON.parse(value || '{}')).map(([name, value]) => ({ name, value })); }
    catch { return []; }
  });
  function update(next: Row[]) {
    setRows(next);
    onChange(JSON.stringify(Object.fromEntries(next.filter(row => row.name.trim()).map(row => [row.name.trim(), row.value]))));
  }
  const duplicate = rows.some((row, index) => row.name.trim() && rows.slice(0, index).some(previous => previous.name.trim() === row.name.trim()));
  return <section className="space-y-3 rounded-xl border border-slate-200 p-4" data-invalid-specifications={duplicate || undefined}>
    <h4 className="text-sm font-bold text-slate-800">Thông số kỹ thuật</h4>
    <p className="text-xs text-slate-600">Model / SKU lấy từ trường mã sản phẩm. Các dòng dưới đây hiển thị trên trang chi tiết.</p>
    {rows.map((row, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
      <input aria-label={'Tên thông số ' + (index + 1)} className="min-w-0 rounded-lg border px-3 py-2 text-sm" value={row.name} required
        onChange={e => update(rows.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
      <input aria-label={'Giá trị thông số ' + (index + 1)} className="min-w-0 rounded-lg border px-3 py-2 text-sm"
        value={typeof row.value === 'object' ? JSON.stringify(row.value) : String(row.value ?? '')}
        onChange={e => update(rows.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} />
      <button type="button" className="rounded-lg border px-3 py-2 text-sm text-red-700" onClick={() => update(rows.filter((_, i) => i !== index))}>Xóa</button>
    </div>)}
    {duplicate && <p role="alert" className="text-xs text-red-700">Tên thông số cần khác nhau.</p>}
    {duplicate && <input className="sr-only" tabIndex={-1} aria-label="Tên thông số trùng" required value="" onChange={() => {}} />}
    <button type="button" className="rounded-lg border px-3 py-2 text-sm font-semibold text-brand-primary" onClick={() => update([...rows, { name: '', value: '' }])}>Thêm thông số</button>
  </section>;
}
