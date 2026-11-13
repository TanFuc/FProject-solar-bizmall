'use client';

import { useState, type FormEvent } from 'react';
import { getSiteShell, getProductCategories, getAudiences, getProjectTypes, getProvinces, getArticleTags } from '@/lib/api/client';
import { englishLabel, siteTranslationFields } from '@/lib/i18n/site-shell';

export function SiteTranslationEditor({ call }: { call: (path: string, options?: RequestInit) => Promise<unknown> }) {
  const [fields, setFields] = useState<ReturnType<typeof siteTranslationFields>>();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load() {
    setBusy(true);
    setMessage('');
    try {
      const [shell, categories, audiences, types, provinces, tags] = await Promise.all([getSiteShell('en-US'), getProductCategories(), getAudiences(), getProjectTypes(), getProvinces(), getArticleTags()]);
      const found = siteTranslationFields(shell);
      const extra = [...categories.flatMap(row => [row.name, row.description || '']), ...audiences.flatMap(row => [row.label, row.description || '']), ...[...types, ...provinces, ...tags].map(row => row.label)];
      for (const source of new Set(extra.filter(Boolean))) {
        if (!found.some(field => field.source === source)) found.push({ source, defaultValue: englishLabel(source) === source ? '' : englishLabel(source) });
      }
      setLabels({ ...shell.englishLabels });
      setFields(found);
    } catch {
      setMessage('Không đọc được nhãn giao diện.');
    } finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const filled = Object.fromEntries(Object.entries(labels).filter(([, value]) => value.trim()));
      await call('/admin/site-translations', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ labels: filled }),
      });
      setMessage('Đã lưu nhãn tiếng Anh.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được nhãn.');
    } finally { setBusy(false); }
  }
  return <section className="media-panel media-content-editor">
    <h2>Tiếng Anh cho giao diện chung</h2>
    <p className="media-selection">Tên menu, nhóm footer, chi nhánh, giờ hoạt động và nhãn liên hệ.</p>
    {!fields && <button type="button" disabled={busy} onClick={() => void load()}>Mở trường tiếng Anh</button>}
    {fields && <form onSubmit={save}>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map(({ source, defaultValue }) => <label key={source}>{source}
          <input lang="en" value={labels[source] ?? ''} placeholder={defaultValue || 'English translation'}
            onChange={event => setLabels({ ...labels, [source]: event.target.value })} />
        </label>)}
      </div>
      <button disabled={busy} type="submit">Lưu nhãn tiếng Anh</button>
    </form>}
    {message && <p role="status">{message}</p>}
  </section>;
}
