import { object } from './blocks';

export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

const nodeTypes = new Set([
  'doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem',
  'blockquote', 'hardBreak', 'horizontalRule', 'codeBlock', 'image', 'text',
]);
const markTypes = new Set(['bold', 'italic', 'strike', 'underline', 'code', 'link', 'textFormat']);

export const documentFonts = {
  inter: 'Inter Variable, sans-serif',
  arial: 'Arial, sans-serif',
  georgia: 'Georgia, serif',
  times: 'Times New Roman, serif',
  courier: 'Courier New, monospace',
};

export function textStyleAttributes(attrs: Record<string, unknown> = {}) {
  const font = typeof attrs.font === 'string' && Object.hasOwn(documentFonts, attrs.font) ? attrs.font as keyof typeof documentFonts : undefined;
  const size = typeof attrs.size === 'number' && Number.isInteger(attrs.size) && attrs.size >= 10 && attrs.size <= 72 ? attrs.size : undefined;
  const color = typeof attrs.color === 'string' && /^#[0-9a-f]{6}$/i.test(attrs.color) ? attrs.color : undefined;
  return { font, size, color };
}

export function documentTextStyle(attrs: Record<string, unknown>) {
  const { font, size, color } = textStyleAttributes(attrs);
  return { fontFamily: font ? documentFonts[font] : undefined, fontSize: size ? size + 'px' : undefined, color };
}

export function mediaSource(value: unknown) {
  if (typeof value !== 'string' || /[\s\\]/.test(value)) return undefined;
  return /^\/(?![\/\\])/.test(value) || /^https?:\/\/[^\s]+$/i.test(value) ? value : undefined;
}

export function safeLink(value: unknown) {
  return mediaSource(value) || (typeof value === 'string' && /^(mailto:|tel:|#)[^\s]+$/i.test(value) ? value : undefined);
}

export function textAlign(value: unknown) {
  return value === 'center' || value === 'right' || value === 'justify' ? value : 'left';
}

export function imagePlacement(value: unknown) {
  return value === 'left' || value === 'right' || value === 'float-left' || value === 'float-right' ? value : 'center';
}

export function imageWidth(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(20, Math.min(100, value)) : 100;
}

function readNode(value: unknown, depth: number): RichNode | undefined {
  if (depth > 32 || !object(value) || typeof value.type !== 'string' || !nodeTypes.has(value.type)) return;
  const type = value.type;
  const attrs = object(value.attrs) ? value.attrs : {};
  if (type === 'image') {
    const src = mediaSource(attrs.src);
    if (!src) return;
    return { type, attrs: {
      src,
      alt: typeof attrs.alt === 'string' ? attrs.alt : '',
      title: typeof attrs.title === 'string' ? attrs.title : '',
      caption: typeof attrs.caption === 'string' ? attrs.caption : '',
      mediaId: typeof attrs.mediaId === 'string' ? attrs.mediaId : null,
      placement: imagePlacement(attrs.placement),
      widthPercent: imageWidth(attrs.widthPercent),
    } };
  }
  if (type === 'text') {
    if (typeof value.text !== 'string' || !value.text) return;
    const marks = Array.isArray(value.marks) ? value.marks.flatMap(mark => {
      if (!object(mark) || typeof mark.type !== 'string' || !markTypes.has(mark.type)) return [];
      if (mark.type === 'textFormat') return [{ type: mark.type, attrs: textStyleAttributes(object(mark.attrs) ? mark.attrs : {}) }];
      if (mark.type !== 'link') return [{ type: mark.type }];
      const href = object(mark.attrs) && safeLink(mark.attrs.href);
      return href ? [{ type: 'link', attrs: { href } }] : [];
    }) : [];
    return { type, text: value.text, marks };
  }
  const content = Array.isArray(value.content) ? value.content.flatMap(child => readNode(child, depth + 1) ?? []) : undefined;
  if (type === 'heading') return { type, attrs: {
    level: attrs.level === 3 || attrs.level === 4 ? attrs.level : 2, textAlign: textAlign(attrs.textAlign),
  }, content };
  if (type === 'paragraph') return { type, attrs: { textAlign: textAlign(attrs.textAlign) }, content };
  if (type === 'orderedList') return { type, attrs: { start: typeof attrs.start === 'number' ? Math.max(1, Math.trunc(attrs.start)) : 1 }, content };
  return { type, content };
}

function plainDocument(text: string): RichNode {
  return { type: 'doc', content: text.trim() ? text.split(/\n\s*\n/).filter(part => part.trim()).map(part => ({
    type: 'paragraph',
    content: part.split(/\r?\n/).flatMap((line, index) => [
      ...(index ? [{ type: 'hardBreak' }] : []),
      ...(line ? [{ type: 'text', text: line }] : []),
    ]),
  })) : [{ type: 'paragraph' }] };
}

export function readDocument(value: unknown, allowPlain = true): RichNode {
  if (typeof value === 'string') {
    try {
      return readDocument(JSON.parse(value), false);
    } catch {
      return plainDocument(allowPlain ? value : '');
    }
  }
  if (!object(value)) return plainDocument('');
  if (value.type === 'doc') return readNode(value, 0) ?? plainDocument('');
  if (object(value.document)) return readDocument(value.document, false);
  if (typeof value.content === 'string') return readDocument(value.content);
  if (Array.isArray(value.blocks)) {
    return { type: 'doc', content: value.blocks.flatMap(block => {
      if (!object(block) || typeof block.content !== 'string' || !block.content) return [];
      if (block.type === 'heading') return [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: block.content }] }];
      return plainDocument(block.content).content ?? [];
    }) };
  }
  return plainDocument('');
}

export function documentText(value: unknown): string {
  function text(node: RichNode): string {
    if (node.type === 'image') return typeof node.attrs?.caption === 'string' ? node.attrs.caption : '';
    return node.text || (node.content ?? []).map(text).join(node.type === 'paragraph' || node.type === 'heading' ? '' : ' ');
  }
  return text(readDocument(value)).trim();
}

export function hasDocumentContent(doc: RichNode): boolean {
  return Boolean(doc.text?.trim() || doc.type === 'image' || doc.content?.some(hasDocumentContent));
}

export function replaceDocument(value: string | undefined, document: RichNode): string {
  if (value) {
    try {
      const existing: unknown = JSON.parse(value);
      if (object(existing) && existing.type !== 'doc' && (object(existing.document) || (typeof existing.content !== 'string' && !Array.isArray(existing.blocks)))) {
        return JSON.stringify({ ...existing, document });
      }
    } catch {
      // Plain-text records are converted the first time they are edited.
    }
  }
  return JSON.stringify(document);
}

export function projectDocumentFacts(value?: string) {
  try {
    const data: unknown = JSON.parse(value || '{}');
    if (!object(data)) return {};
    const stringValue = (key: string) => typeof data[key] === 'string' ? data[key] : undefined;
    return { location: stringValue('location'), connectionDate: stringValue('gridConnectionDate'),
      panels: stringValue('panels'), inverter: stringValue('inverter'), battery: stringValue('battery') };
  } catch { return {}; }
}
