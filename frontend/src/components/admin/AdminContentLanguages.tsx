'use client';

import { ReactNode, useState } from 'react';
import { RichContentEditor } from './RichContentEditor';
import { hasDocumentContent } from '@/lib/api/content-body';
import type { EnglishContent } from '@/types/bmsolar-api';

const labels: Record<keyof EnglishContent, string> = {
  title: 'Title', summary: 'Summary', body: 'Content', subtitle: 'Subtitle',
  benefitsText: "Benefits (title | description, one per line)",
  equipmentText: "Equipment (name | brand | warranty, one per line)",
  processText: "Process (title | description, one step per line)",
  capacity: 'Capacity range', savings: 'Monthly savings', roi: 'Payback period', warranty: 'Warranty',
};

export function AdminContentLanguages({ children, value, onChange, fields, allowEnglish, getToken }: {
  children: ReactNode;
  value?: EnglishContent | null;
  onChange: (value: EnglishContent) => void;
  fields: (keyof EnglishContent)[];
  allowEnglish: boolean;
  getToken: () => Promise<string>;
}) {
  const [editingEnglish, setEditingEnglish] = useState(false);
  return <>
    <div className="flex gap-2" role="group" aria-label="Ngôn ngữ nội dung">
      <button type="button" className="rounded-lg border px-3 py-2 text-xs font-semibold aria-pressed:border-brand-primary aria-pressed:text-brand-primary"
        aria-pressed={!editingEnglish} onClick={() => setEditingEnglish(false)}>Tiếng Việt</button>
      <button type="button" className="rounded-lg border px-3 py-2 text-xs font-semibold aria-pressed:border-brand-primary aria-pressed:text-brand-primary disabled:opacity-50"
        disabled={!allowEnglish} aria-pressed={editingEnglish} onClick={() => setEditingEnglish(true)}>English</button>
    </div>
    <fieldset disabled={editingEnglish} className={editingEnglish ? 'hidden' : 'min-w-0 space-y-4'}>
      {children}
    </fieldset>
    {editingEnglish && <div lang="en" className="space-y-3">
      <p className="text-xs text-slate-600">Optional. Leave the English title blank to hide the English edition on the website.</p>
      {fields.map(field => field === "body" ? <RichContentEditor key={field} label="Article content" value={value?.body} getToken={getToken}
        onChange={document => onChange({ ...value, body: hasDocumentContent(document) ? JSON.stringify(document) : "" })} /> : <label key={field} className="block text-xs font-semibold text-slate-700">
        {labels[field]}
        <textarea rows={field.endsWith('Text') ? 5 : field === 'summary' ? 3 : 1}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={value?.[field] || ''} onChange={event => onChange({ ...value, [field]: event.target.value })} />
      </label>)}
    </div>}
  </>;
}
