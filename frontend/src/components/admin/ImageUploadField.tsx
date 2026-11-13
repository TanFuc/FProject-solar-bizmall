'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/client';

export function ImageUploadField({ label, value, assetId, getToken, onUpload, onUrlChange }: {
  label: string;
  value?: string;
  assetId?: string | null;
  getToken: () => Promise<string>;
  onUpload: (asset: { id: string; url: string }) => void;
  onUrlChange?: (url: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedImage, setSavedImage] = useState<{ id: string; url: string }>();
  const getAccessToken = useRef(getToken);
  getAccessToken.current = getToken;

  useEffect(() => {
    if (value || !assetId) return;
    const request = new AbortController();
    void getAccessToken.current().then(async token => {
      const response = await fetch(API_BASE_URL + '/admin/media/' + encodeURIComponent(assetId), {
        headers: { Authorization: 'Bearer ' + token }, signal: request.signal,
      });
      if (!response.ok) return;
      const { data } = await response.json();
      if (!request.signal.aborted && typeof data?.url === 'string') setSavedImage({ id: assetId, url: data.url });
    }).catch(() => {});
    return () => request.abort();
  }, [assetId, value]);

  const previewUrl = value || (savedImage && savedImage.id === assetId ? savedImage.url : undefined);

  async function upload(file: File) {
    setError('');
    if (file.size > 25 * 1024 * 1024) {
      setError('Ảnh cần nhỏ hơn 25 MB.');
      return;
    }
    setBusy(true);
    try {
      const token = await getToken();
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(API_BASE_URL + '/admin/media/upload', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token }, body,
      });
      const result = await response.json();
      if (!response.ok || typeof result.data?.id !== 'string' || typeof result.data?.url !== 'string') {
        throw new Error(result.error?.message || 'Không tải được ảnh.');
      }
      if (field.current) onUpload(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được ảnh.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={field} className="space-y-2" aria-busy={busy} data-image-upload={busy ? 'pending' : 'idle'}>
      <p className="text-xs font-bold uppercase text-slate-700">{label}</p>
      {previewUrl && <img src={previewUrl} alt={label} className="h-24 max-w-full rounded-lg border object-contain" />}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden
        onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void upload(file);
        }} />
      <button type="button" disabled={busy} onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
        <Upload size={16} /> {busy ? 'Đang tải ảnh…' : 'Tải ảnh từ máy'}
      </button>
      {onUrlChange && <label className="block text-xs text-slate-600">Hoặc nhập URL ảnh
        <input type="text" value={value || ''} disabled={busy} onChange={event => onUrlChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
