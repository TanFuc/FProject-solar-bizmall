'use client';

import { FormEvent, useEffect, useState } from 'react';
import { aboutImages, aboutImageKey } from '@/lib/api/about-images';
import { ImageUploadField } from './ImageUploadField';
import { aboutGroups } from './about-fields';
import { RichContentEditor } from './RichContentEditor';
import { readDocument } from '@/lib/api/content-body';
import { object } from '@/lib/api/blocks';

export interface CmsPageRow {
  id: string;
  pageKey: string;
  routeSlug: string;
  title: string;
  locale: string;
  publicationState: string;
}

type Path = (string | number)[];
type FormData = { blocks: unknown[]; seo: unknown };

const structuralKeys = /^(id|key|type|kind|slug|icon|variant|theme|color|status|locale|date|target|href|email|phone|anchor|layout|size|style|align|position|provider|mimeType|currency|sku|code|formKey|entityType|entityId|nameKey|document|brandStoryDocument|visibility)$|(?:Id|Ids|Key|Url|Slug|Color|At)$/i;
const structuralValues = /^(?:https?:\/\/|mailto:|tel:|\/|#)/;
const labels: Record<string, string> = {
  title: 'Tiêu đề', subtitle: 'Mô tả phụ', headline: 'Tiêu đề khối', description: 'Mô tả',
  accentPhrase: 'Cụm từ nhấn mạnh', eyebrow: 'Nhãn phía trên tiêu đề', label: 'Nhãn',
  alt: 'Mô tả ảnh', question: 'Câu hỏi', answer: 'Câu trả lời', metaTitle: 'Tiêu đề SEO',
  metaDescription: 'Mô tả SEO', projects: 'Tiêu đề dự án', news: 'Tiêu đề tin tức',
};

function textFields(value: unknown, path: Path = []): { path: Path; text: string }[] {
  if (typeof value === 'string') return structuralValues.test(value) ? [] : [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => textFields(item, [...path, index]));
  if (!object(value)) return [];
  return Object.entries(value).flatMap(([key, item]) =>
    structuralKeys.test(key) ? [] : textFields(item, [...path, key]));
}

function setField(root: unknown, path: Path, value: unknown): unknown {
  const [key, ...rest] = path;
  if (key === undefined) return value;
  if (Array.isArray(root)) return root.map((item, index) => index === key ? setField(item, rest, value) : item);
  if (object(root)) return { ...root, [key]: setField(root[key], rest, value) };
  return root;
}

function readField(root: unknown, path: Path): unknown {
  return path.reduce<unknown>((value, key) =>
    Array.isArray(value) ? value[Number(key)] : object(value) ? value[key] : undefined, root);
}

async function readDraft(call: Call, id: string) {
  const data = await call('/admin/pages/' + id);
  if (!object(data) || !Array.isArray(data.revisions)) throw new Error('Không đọc được bản nội dung.');
  const revisionId = data.currentDraftRevisionId || data.publishedRevisionId;
  const revision = data.revisions.find(row => object(row) && row.id === revisionId);
  if (!object(revision) || typeof revision.blocksJson !== 'string') throw new Error('Trang chưa có bản nội dung.');
  const blocks: unknown = JSON.parse(revision.blocksJson);
  if (!Array.isArray(blocks)) throw new Error('Nội dung trang không hợp lệ.');
  return {
    revisionId,
    title: String(data.title || ''),
    content: { blocks, seo: typeof revision.seoJson === 'string' ? JSON.parse(revision.seoJson) : null } as FormData,
  };
}

type Call = (path: string, options?: RequestInit) => Promise<unknown>;

function json(method: string, body: object): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export function PageLanguageEditor({ pages, call, reload, getToken, initialPageKey }: { pages: CmsPageRow[]; call: Call; reload: () => Promise<void>; getToken: () => Promise<string>; initialPageKey?: string }) {
  const [pageKey, setPageKey] = useState('');
  const [locale, setLocale] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [editor, setEditor] = useState<FormData>();
  const [reference, setReference] = useState<FormData>();
  const [fields, setFields] = useState<Path[]>([]);
  const [title, setTitle] = useState('');
  const [revision, setRevision] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [documentReset, setDocumentReset] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const vi = pages.find(page => page.pageKey === pageKey && page.locale === 'vi-VN');
  const current = pages.find(page => page.pageKey === pageKey && page.locale === locale);

  useEffect(() => {
    if (initialPageKey && !pageKey && pages.some(page => page.pageKey === initialPageKey && page.locale === "vi-VN")) {
      void open(initialPageKey, "vi-VN");
    }
  }, [initialPageKey, pageKey, pages]);

  async function open(key: string, language: typeof locale) {
    if (key === pageKey && language === locale) return;
    if (dirty && !window.confirm("Nội dung chưa lưu. Bạn có muốn bỏ thay đổi để chuyển bản đang soạn?")) return;
    setDirty(false);
    setPageKey(key);
    setLocale(language);
    setEditor(undefined);
    setReference(undefined);
    setError('');
    setMessage('');
    if (!key) return;
    setBusy(true);
    try {
      const source = pages.find(page => page.pageKey === key && page.locale === 'vi-VN');
      if (!source) return;
      const base = await readDraft(call, source.id);
      const target = pages.find(page => page.pageKey === key && page.locale === language);
      const draft = target ? (target.id === source.id ? base : await readDraft(call, target.id)) : undefined;
      setReference(base.content);
      const template = textFields(base.content).reduce<unknown>(
        (content, field) => setField(content, field.path, ''), base.content) as FormData;
      const content = draft?.content ?? { ...template, blocks: template.blocks.filter(block => !object(block) || block.id !== "editor_long_content").map(block => {
        if (!object(block) || !object(block.data) || !object(block.data.copy)) return block;
        const copy = { ...block.data.copy };
        delete copy.brandStoryDocument;
        return { ...block, data: { ...block.data, copy } };
      }) };
      const editable = { ...content, seo: { metaTitle: "", metaDescription: "", ...(object(content.seo) ? content.seo : {}) } };
      setEditor(editable);
      setFields(textFields(editable).map(field => field.path));
      setTitle(draft?.title ?? '');
      setRevision(draft?.revisionId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đọc được nội dung.');
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vi || !editor || busy || event.currentTarget.querySelector('[data-image-upload="pending"]')) return;
    const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publish';
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!title.trim()) throw new Error('Điền tiêu đề của bản đang chỉnh sửa trước khi lưu.');
      const payload = { blocksJson: JSON.stringify(editor.blocks), seoJson: editor.seo ? JSON.stringify(editor.seo) : null };
      let id = current?.id;
      if (id) {
        const latest = await readDraft(call, id);
        if (latest.revisionId !== revision) throw new Error('Trang đã được chỉnh sửa ở phiên khác. Hãy mở lại trước khi lưu.');
        const saved = await call('/admin/pages/' + id + '/revisions', json('POST', payload));
        if (object(saved)) setRevision(saved.id);
        if (title.trim() !== current?.title) await call('/admin/pages/' + id, json('PUT', { title: title.trim() }));
      } else {
        const created = await call('/admin/pages', json('POST', {
          ...payload, pageKey: vi.pageKey, routeSlug: vi.routeSlug, locale, title: title.trim(),
        }));
        if (!object(created) || typeof created.id !== 'string') throw new Error('Không đọc được mã trang vừa tạo.');
        id = created.id;
        setRevision(created.currentDraftRevisionId);
      }
      await reload();
      if (publish) {
        await call('/admin/pages/' + id + '/publish', json('POST', {}));
        await reload();
      }
      setDirty(false);
      setMessage(publish ? 'Đã xuất bản phiên bản ngôn ngữ này.' : 'Đã lưu bản nháp.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không lưu được nội dung.');
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    if (!current || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await call('/admin/pages/' + current.id + '/unpublish', json('POST', {}));
      await reload();
      setMessage('Đã ẩn bản tiếng Anh và giữ lại bản nháp.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không ẩn được nội dung.');
    } finally {
      setBusy(false);
    }
  }

  const longBlock = editor?.blocks.find(block => object(block) && block.id === "editor_long_content");
  const longDocument = object(longBlock) && object(longBlock.data) ? longBlock.data.document : undefined;

  function renderField(path: Path, name?: string) {
    const value = String(readField(editor, path) ?? '');
    const field = String(path[path.length - 1]);
    const hint = reference && readField(reference, path);
    return <label key={path.join('.')}>{name || labels[field] || field}
      <textarea rows={value.length > 100 ? 3 : 2} value={value}
        placeholder={locale === 'en-US' && typeof hint === 'string' ? hint : undefined}
        onChange={event => {
          setEditor(current => current && setField(current, path, event.target.value) as FormData);
          setDirty(true);
        }} />
    </label>;
  }

  const storyBlock = editor?.blocks.find(block => object(block) && block.id === 'seed_visual_v3_copy');
  const storyCopy = object(storyBlock) && object(storyBlock.data) && object(storyBlock.data.copy) ? storyBlock.data.copy : null;
  const storyDocument = storyCopy && (storyCopy.brandStoryDocument || readDocument(
    [storyCopy.content007, storyCopy.content008].filter(value => typeof value === 'string').join('\n\n')
  ));

  function setAboutCopy(key: string, value: string) {
    setDirty(true);
    setEditor(current => current && { ...current, blocks: current.blocks.map(block =>
      object(block) && block.id === 'seed_visual_v3_copy' && object(block.data) && object(block.data.copy)
        ? { ...block, data: { ...block.data, copy: { ...block.data.copy, [key]: value } } } : block) });
  }

  function renderAboutImage(slot: keyof typeof aboutImages) {
    const key = aboutImageKey(slot);
    const gallery = editor?.blocks.find(block => object(block) && block.id === 'seed_visual_v3_media');
    const items = object(gallery) && object(gallery.data) && Array.isArray(gallery.data.items) ? gallery.data.items.filter(object) : [];
    const custom = items.find(item => item.key === key);
    const image = custom || items.find(item => item.key === aboutImages[slot].fallback);
    function update(next: Record<string, unknown> | null) {
      setDirty(true);
      setEditor(current => {
        if (!current) return current;
        const existing = current.blocks.find(block => object(block) && block.id === 'seed_visual_v3_media');
        const data = object(existing) && object(existing.data) ? existing.data : {};
        const rows = Array.isArray(data.items) ? data.items.filter(object) : [];
        const nextBlock = { id: 'seed_visual_v3_media', type: 'projectGallery', version: 1, enabled: true,
          sortOrder: 50, visibility: 'all', ...(object(existing) ? existing : {}),
          data: { ...data, items: [...rows.filter(row => row.key !== key), ...(next ? [{ ...next, key }] : [])] } };
        return { ...current, blocks: existing ? current.blocks.map(block => block === existing ? nextBlock : block) : [...current.blocks, nextBlock] };
      });
    }
    return <div key={key} className="rounded-lg border border-slate-200 p-3">
      <ImageUploadField label={aboutImages[slot].label} value={typeof image?.mediaUrl === 'string' ? image.mediaUrl : undefined}
        assetId={typeof image?.mediaId === 'string' ? image.mediaId : undefined} getToken={getToken}
        onUpload={({ id, url }) => update({ ...image, mediaId: id, mediaUrl: url })} />
      {slot !== 'journey' && <label>Mô tả ảnh<input value={typeof image?.alt === 'string' ? image.alt : ''}
        onChange={event => update({ ...image, alt: event.target.value })} /></label>}
      <div className="flex flex-wrap gap-2">
        {Boolean(image?.mediaId || image?.mediaUrl) && <button type="button" onClick={() => update({ alt: image?.alt, mediaId: '', mediaUrl: '' })}>Gỡ ảnh</button>}
        {custom && <button type="button" onClick={() => update(null)}>Dùng ảnh gốc</button>}
      </div>
    </div>;
  }

  function renderAboutHeroImage() {
    const index = editor?.blocks.findIndex(block => object(block) && block.type === 'heroCarousel') ?? -1;
    if (index < 0) return null;
    const path = ['blocks', index, 'data', 'slides', 0];
    const slide = readField(editor, path);
    if (!object(slide)) return null;
    return <div><ImageUploadField label="Ảnh đầu trang" value={typeof slide.desktopMediaUrl === 'string' ? slide.desktopMediaUrl : undefined}
      assetId={typeof slide.desktopMediaId === 'string' ? slide.desktopMediaId : undefined} getToken={getToken}
      onUpload={({ id, url }) => {
        setDirty(true);
        setEditor(current => current && setField(current, path, { ...slide, desktopMediaId: id, mobileMediaId: id, desktopMediaUrl: url, mobileMediaUrl: url }) as FormData);
      }} />
      {Boolean(slide.desktopMediaId || slide.desktopMediaUrl) && <button type="button" className="mt-2" onClick={() => {
        setDirty(true);
        setEditor(current => current && setField(current, path, { ...slide, desktopMediaId: "", mobileMediaId: "", desktopMediaUrl: "", mobileMediaUrl: "" }) as FormData);
      }}>Gỡ ảnh đầu trang</button>}
    </div>;
  }

  const groups: { title: string; paths: Path[]; names?: Record<string, string> }[] = [
    { title: 'Tiêu đề đầu trang', paths: fields.filter(path => path.includes('slides') && ['eyebrow','title','accentPhrase','subtitle','label'].includes(String(path.at(-1))) && !path.includes('benefits')) },
    ...aboutGroups.map(([title, names]) => ({
      title, names, paths: fields.filter(path => path.includes('copy') && !['content007', 'content008'].includes(String(path.at(-1))) && !["process5Title", "process5Text"].includes(String(path.at(-1))) && Object.hasOwn(names, String(path.at(-1)))),
    })),
    { title: 'Liên kết và nút', paths: [] },
    { title: 'SEO', paths: fields.filter(path => path[0] === 'seo' && ['metaTitle','metaDescription'].includes(String(path[1]))) },
  ];

  return (
    <section className="media-panel media-content-editor">
      <h2>{initialPageKey === "about" ? "Nội dung Giới thiệu" : "Nội dung theo ngôn ngữ"}</h2>
      {!initialPageKey && <label>Trang
        <select disabled={busy} value={pageKey} onChange={event => void open(event.target.value, 'vi-VN')}>
          <option value="">Chọn trang</option>
          {pages.filter(page => page.locale === 'vi-VN').map(page => <option key={page.id} value={page.pageKey}>{page.title}</option>)}
        </select>
      </label>}
      {pageKey && <div role="group" aria-label="Ngôn ngữ soạn thảo" className="cms-language-tabs mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} aria-pressed={locale === 'vi-VN'} onClick={() => void open(pageKey, 'vi-VN')}>Tiếng Việt</button>
        <button type="button" disabled={busy} aria-pressed={locale === 'en-US'} onClick={() => void open(pageKey, 'en-US')}>English</button>
      </div>}
      {error && <p role="alert" className="media-error">{error}</p>}
      {message && <p role="status" className="media-success">{message}</p>}
      {editor && <form onSubmit={save} aria-busy={busy}>
        <label>Tiêu đề trang<input required value={title} onChange={event => { setTitle(event.target.value); setDirty(true); }} /></label>
        <RichContentEditor key={pageKey + ":" + locale + ":" + documentReset} label="Nội dung dài của trang" value={longDocument} getToken={getToken}
          onChange={document => { setDirty(true); setEditor(current => {
            if (!current) return current;
            const block = { id: "editor_long_content", type: "richText", enabled: true, version: 1,
              sortOrder: 80, visibility: "all", data: { document } };
            return { ...current, blocks: [...current.blocks.filter(item => !object(item) || item.id !== block.id), block] };
          }); }} />
        {initialPageKey === "about" && Boolean(longBlock) && <div className="mb-5 flex"><button type="button" disabled={busy} className="!border !border-red-200 !bg-white !text-red-700 hover:!bg-red-50" onClick={() => {
          if (!window.confirm("Xóa phần nội dung dài khỏi bản đang chỉnh sửa?")) return;
          setDirty(true);
          setDocumentReset(value => value + 1);
          setEditor(current => current && { ...current, blocks: current.blocks.filter(block => !object(block) || block.id !== "editor_long_content") });
        }}>Xóa nội dung dài</button></div>}
        {pageKey === 'about' ? <div className="grid gap-2">
          {groups.filter(group => group.paths.length || group.title === "Liên kết và nút").map(group => <details key={group.title} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <summary className="cursor-pointer font-semibold">{group.title}</summary>
            <div className="mt-3 grid gap-2 md:grid-cols-2">{group.paths.map(path => renderField(path, group.names?.[String(path.at(-1))]))}</div>
            {group.title === 'Tiêu đề đầu trang' && renderAboutHeroImage()}
            {group.title === 'Câu chuyện thương hiệu' && renderAboutImage('story')}
            {group.title === 'Năng lực và thư viện ảnh' && <div className="grid gap-3 md:grid-cols-2">{(['benefitHome', 'benefitFactory', 'benefitEv', 'galleryEv', 'galleryHome', 'galleryFactory'] as const).map(renderAboutImage)}</div>}
            {group.title === 'Quy trình và liên hệ' && renderAboutImage('journey')}
            {group.title === 'Liên kết và nút' && Object.entries({
              storyTopLink: 'Liên kết đầu câu chuyện', storyBottomLink: 'Nút tìm hiểu', valuesLink: 'Nút giá trị',
              benefitsLink: 'Nút năng lực', benefitHomeLink: 'Thẻ tiết kiệm', benefitFactoryLink: 'Thẻ bền vững',
              benefitEvLink: 'Thẻ tự chủ', galleryLink: 'Nút thư viện', processTarget: 'Nút quy trình',
              journeyPrimaryTarget: 'Nút tư vấn', journeySecondaryTarget: 'Nút dự án', heroPrimaryTarget: 'Nút chính đầu trang',
              heroSecondaryTarget: 'Nút phụ đầu trang', heroSecondary: 'Nhãn nút phụ đầu trang',
            }).map(([key, label]) => <label key={key}>{label}<input value={String(storyCopy?.[key] ?? '')}
              onChange={event => setAboutCopy(key, event.target.value)} /></label>)}
            {group.title === "Câu chuyện thương hiệu" && storyCopy && <RichContentEditor key={pageKey + locale + "-story"}
              label="Nội dung câu chuyện" value={storyDocument} getToken={getToken} onChange={document => {
                setDirty(true);
                setEditor(current => current && { ...current, blocks: current.blocks.map(block => {
                  if (!object(block) || block.id !== "seed_visual_v3_copy" || !object(block.data) || !object(block.data.copy)) return block;
                  return { ...block, data: { ...block.data, copy: { ...block.data.copy, brandStoryDocument: JSON.stringify(document) } } };
                }) });
              }} />}
          </details>)}
        </div> : fields.map(path => renderField(path))}
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={busy} type="submit" value="draft">Lưu bản nháp</button>
          <button disabled={busy} type="submit" value="publish">Lưu & xuất bản</button>
          {locale === 'en-US' && current?.publicationState === 'published' &&
            <button disabled={busy} type="button" onClick={() => void unpublish()}>Ẩn bản tiếng Anh</button>}
        </div>
      </form>}
    </section>
  );
}
