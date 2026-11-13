'use client';

import { useId, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { NodeSelection } from '@tiptap/pm/state';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, RemoveFormatting, Underline, Undo2 } from 'lucide-react';
import { RichDocument } from '@/components/ui/RichDocument';
import { uploadAdminImage } from '@/lib/api/admin-image';
import { documentFonts, documentTextStyle, textStyleAttributes, imagePlacement, imageWidth, readDocument, safeLink, type RichNode } from '@/lib/api/content-body';

const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null },
      caption: { default: '' },
      placement: { default: 'center' },
      widthPercent: { default: 100 },
    };
  },
  parseHTML() {
    return [{
      tag: 'figure[data-placement]',
      getAttrs: element => {
        const img = element.querySelector('img');
        return img ? {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          mediaId: element.getAttribute('data-media-id'),
          caption: element.querySelector('figcaption')?.textContent || '',
          placement: imagePlacement(element.getAttribute('data-placement')),
          widthPercent: imageWidth(parseFloat(element.style.width)),
        } : false;
      },
    }, ...(this.parent?.() ?? [])];
  },
  renderHTML({ node }) {
    const { src, alt, title, mediaId, placement, widthPercent, caption } = node.attrs;
    return ['figure', {
      'data-placement': imagePlacement(placement),
      'data-media-id': mediaId,
      style: 'width:' + imageWidth(widthPercent) + '%',
    }, ['img', { src, alt: alt || '', title }], ...(caption ? [['figcaption', {}, caption]] : [])];
  },
});

const TextFormat = Mark.create({
  name: 'textFormat',
  addAttributes() {
    return {
      font: { default: null },
      size: { default: null },
      color: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-text-format]', getAttrs: element => ({
      font: element.getAttribute('data-font'),
      size: Number(element.getAttribute('data-size')) || null,
      color: element.getAttribute('data-color'),
    }) }];
  },
  renderHTML({ mark }) {
    const attrs = textStyleAttributes(mark.attrs);
    const style = documentTextStyle(mark.attrs);
    return ['span', {
      'data-text-format': '',
      'data-font': attrs.font,
      'data-size': attrs.size,
      'data-color': attrs.color,
      style: [style.fontFamily && 'font-family:' + style.fontFamily,
        style.fontSize && 'font-size:' + style.fontSize, style.color && 'color:' + style.color].filter(Boolean).join(';'),
    }, 0];
  },
});

const extensions = [
  TextFormat,
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, isAllowedUri: value => Boolean(safeLink(value)) },
  }),
  ArticleImage,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

export function RichContentEditor({ label, value, onChange, getToken }: {
  label: string;
  value: unknown;
  onChange: (document: RichNode) => void;
  getToken: () => Promise<string>;
}) {
  const id = useId();
  const filePicker = useRef<HTMLInputElement>(null);
  const uploadPending = useRef(false);
  const uploadFromEditor = useRef<(file: File) => void>(() => {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'edit' | 'desktop' | 'mobile'>('edit');
  const editor = useEditor({
    extensions,
    content: readDocument(value),
    immediatelyRender: false,
    editorProps: {
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files || []).find(item => item.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        uploadFromEditor.current(file);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const file = !moved && Array.from(event.dataTransfer?.files || []).find(item => item.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (position) editor?.commands.setTextSelection(position.pos);
        uploadFromEditor.current(file);
        return true;
      },
      attributes: { class: 'solar-document rich-editor-surface', 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' },
    },
    onUpdate: ({ editor }) => onChange(readDocument(editor.getJSON())),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        format: textStyleAttributes(editor.getAttributes("textFormat")),
        bold: editor.isActive('bold'), italic: editor.isActive('italic'), underline: editor.isActive('underline'),
        bulletList: editor.isActive('bulletList'), orderedList: editor.isActive('orderedList'), quote: editor.isActive('blockquote'),
        heading: String(editor.getAttributes('heading').level || 'paragraph'),
        image: editor.state.selection instanceof NodeSelection && editor.state.selection.node.type.name === 'image' ? editor.getAttributes('image') : null,
      };
    },
  });

  async function insertImage(file: File) {
    if (!editor || uploadPending.current) return;
    uploadPending.current = true;
    setBusy(true);
    setError('');
    editor.setEditable(false);
    try {
      const asset = await uploadAdminImage(file, getToken);
      if (!editor.isDestroyed) {
        editor.setEditable(true);
        const selection = editor.state.selection;
        const position = selection instanceof NodeSelection || selection.$to.depth === 0 ? selection.to : selection.$to.after(1);
        editor.chain().insertContentAt(position, { type: 'image', attrs: { src: asset.url, mediaId: asset.id } })
          .setNodeSelection(position).focus().run();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được ảnh.');
    } finally {
      if (!editor.isDestroyed) editor.setEditable(true);
      uploadPending.current = false;
      setBusy(false);
    }
  }

  uploadFromEditor.current = file => { void insertImage(file); };

  function moveImage(direction: -1 | 1) {
    if (!editor) return;
    const { selection, doc, tr } = editor.state;
    if (!(selection instanceof NodeSelection) || selection.$from.depth !== 0) return;
    const index = selection.$from.index();
    const neighborIndex = index + direction;
    if (neighborIndex < 0 || neighborIndex >= doc.childCount) return;
    const neighbor = doc.child(neighborIndex);
    const next = direction < 0 ? selection.from - neighbor.nodeSize : selection.from + neighbor.nodeSize;
    tr.delete(selection.from, selection.to).insert(next, selection.node);
    tr.setSelection(NodeSelection.create(tr.doc, next));
    editor.view.dispatch(tr);
    editor.view.focus();
  }

  function setFormat(next: Record<string, unknown>) {
    if (!editor) return;
    const attrs = textStyleAttributes({ ...editor.getAttributes("textFormat"), ...next });
    const chain = editor.chain().focus();
    if (attrs.font || attrs.size || attrs.color) chain.setMark("textFormat", attrs).run();
    else chain.unsetMark("textFormat").run();
  }

  function editLink() {
    if (!editor || editor.state.selection.empty) {
      setError('Chọn đoạn văn bản cần gắn liên kết.');
      return;
    }
    const entered = window.prompt('Địa chỉ liên kết (để trống để gỡ)', editor.getAttributes('link').href || '');
    if (entered === null) return;
    const url = entered.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else if (safeLink(url)) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      setError('Địa chỉ liên kết cần bắt đầu bằng https://, http:// hoặc /.');
      return;
    }
    setError('');
  }

  const iconButton = (title: string, icon: React.ReactNode, action: () => void, active?: boolean) => (
    <button type="button" className="rich-tool" title={title} aria-label={title} aria-pressed={active}
      disabled={busy || !editor} onMouseDown={event => event.preventDefault()} onClick={action}>{icon}</button>
  );

  return <section className="rich-editor" aria-labelledby={id} aria-busy={busy} data-image-upload={busy ? 'pending' : 'idle'}>
    <div className="rich-editor-header">
      <h3 id={id}>{label}</h3>
      <div role="group" aria-label="Chế độ hiển thị">
        {([['edit', 'Soạn thảo'], ['desktop', 'Xem trước'], ['mobile', 'Điện thoại']] as const).map(([key, name]) =>
          <button key={key} type="button" className="rich-tool" aria-pressed={mode === key}
            disabled={busy} onClick={() => setMode(key)}>{name}</button>)}
      </div>
    </div>
    <div hidden={mode !== 'edit'}>
      <div className="rich-toolbar" role="group" aria-label="Định dạng văn bản">
        <select aria-label="Kiểu đoạn" className="rich-tool" disabled={!editor || busy} value={state?.heading || 'paragraph'}
          onChange={event => {
            const value = event.target.value;
            if (value === '2' || value === '3' || value === '4') editor?.chain().focus().setHeading({ level: Number(value) as 2 | 3 | 4 }).run();
            else editor?.chain().focus().setParagraph().run();
          }}>
          <option value="paragraph">Đoạn văn</option><option value="2">Tiêu đề 2</option><option value="3">Tiêu đề 3</option><option value="4">Tiêu đề 4</option>
        </select>
        <select aria-label="Phông chữ" className="rich-tool" disabled={!editor || busy} value={state?.format.font ?? ''}
          onChange={event => setFormat({ font: event.target.value })}>
          <option value="">Phông mặc định</option>
          {Object.keys(documentFonts).map(font => <option key={font} value={font}>{font === 'inter' ? 'Inter' : font === 'times' ? 'Times New Roman' : font === 'courier' ? 'Courier New' : font[0]?.toUpperCase() + font.slice(1)}</option>)}
        </select>
        <select aria-label="Cỡ chữ" className="rich-tool" disabled={!editor || busy} value={state?.format.size ?? ''}
          onChange={event => setFormat({ size: Number(event.target.value) })}>
          <option value="">Cỡ mặc định</option>
          {Array.from({ length: 63 }, (_, index) => index + 10).map(size => <option key={size} value={size}>{size} px</option>)}
        </select>
        <input type="color" title="Màu chữ" aria-label="Màu chữ" className="rich-tool rich-color" disabled={!editor || busy}
          value={state?.format.color ?? '#233952'} onChange={event => setFormat({ color: event.target.value })} />
        {iconButton('Xóa định dạng chữ', <RemoveFormatting size={16} />, () => editor?.chain().focus().unsetAllMarks().run())}
        {iconButton('Đậm', <Bold size={16} />, () => editor?.chain().focus().toggleBold().run(), state?.bold)}
        {iconButton('Nghiêng', <Italic size={16} />, () => editor?.chain().focus().toggleItalic().run(), state?.italic)}
        {iconButton('Gạch chân', <Underline size={16} />, () => editor?.chain().focus().toggleUnderline().run(), state?.underline)}
        {iconButton('Căn trái', <AlignLeft size={16} />, () => editor?.chain().focus().setTextAlign('left').run())}
        {iconButton('Căn giữa', <AlignCenter size={16} />, () => editor?.chain().focus().setTextAlign('center').run())}
        {iconButton('Căn phải', <AlignRight size={16} />, () => editor?.chain().focus().setTextAlign('right').run())}
        {iconButton('Căn đều', <AlignJustify size={16} />, () => editor?.chain().focus().setTextAlign('justify').run())}
        {iconButton('Danh sách', <List size={16} />, () => editor?.chain().focus().toggleBulletList().run(), state?.bulletList)}
        {iconButton('Danh sách số', <ListOrdered size={16} />, () => editor?.chain().focus().toggleOrderedList().run(), state?.orderedList)}
        {iconButton('Trích dẫn', <Quote size={16} />, () => editor?.chain().focus().toggleBlockquote().run(), state?.quote)}
        {iconButton('Liên kết', <Link2 size={16} />, editLink)}
        {iconButton('Hoàn tác', <Undo2 size={16} />, () => editor?.chain().focus().undo().run())}
        {iconButton('Làm lại', <Redo2 size={16} />, () => editor?.chain().focus().redo().run())}
        {iconButton('Chèn ảnh từ máy', <ImagePlus size={16} />, () => filePicker.current?.click())}
        <input ref={filePicker} type="file" aria-label="Chọn ảnh trong nội dung" accept="image/jpeg,image/png,image/webp" hidden
          onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void insertImage(file);
          }} />
      </div>
      {state?.image && <div className="rich-image-tools">
        <label>Vị trí ảnh<select value={imagePlacement(state.image.placement)} onChange={event => editor?.commands.updateAttributes('image', { placement: event.target.value })}>
          <option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option>
          <option value="float-left">Trái, chữ bao quanh</option><option value="float-right">Phải, chữ bao quanh</option>
        </select></label>
        <label>Chiều rộng<select value={imageWidth(state.image.widthPercent)} onChange={event => editor?.commands.updateAttributes('image', { widthPercent: Number(event.target.value) })}>
          {[25, 40, 50, 60, 75, 100].map(width => <option key={width} value={width}>{width}%</option>)}
        </select></label>
        <label>Mô tả ảnh<input value={state.image.alt || ''} onChange={event => editor?.commands.updateAttributes('image', { alt: event.target.value })} /></label>
        <label>Chú thích<input value={state.image.caption || ''} onChange={event => editor?.commands.updateAttributes('image', { caption: event.target.value })} /></label>
        <div className="rich-toolbar">
          {iconButton('Đưa ảnh lên', <ArrowUp size={16} />, () => moveImage(-1))}
          {iconButton('Đưa ảnh xuống', <ArrowDown size={16} />, () => moveImage(1))}
        </div>
      </div>}
      {busy && <p role="status" className="rich-editor-status">Đang tải ảnh…</p>}
      {error && <p role="alert" className="rich-editor-error">{error}</p>}
      <EditorContent editor={editor} />
    </div>
    {mode !== 'edit' && <div className="rich-preview">
      <div className={mode === 'mobile' ? 'rich-preview-mobile' : 'rich-preview-desktop'}>
        <RichDocument value={value} />
      </div>
    </div>}
  </section>;
}
