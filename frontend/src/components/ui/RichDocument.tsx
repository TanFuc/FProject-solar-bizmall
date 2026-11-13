import { Fragment, type ReactNode } from 'react';
import { documentTextStyle, hasDocumentContent, imagePlacement, imageWidth, mediaSource, readDocument, safeLink, textAlign, type RichNode } from '@/lib/api/content-body';

function render(node: RichNode): ReactNode {
  const children = node.content?.map((child, index) => <Fragment key={index}>{render(child)}</Fragment>);
  const style = { textAlign: textAlign(node.attrs?.textAlign) } as const;
  switch (node.type) {
    case 'doc': return children;
    case 'paragraph': return <p style={style}>{children?.length ? children : <br />}</p>;
    case 'heading': {
      const level = node.attrs?.level;
      if (level === 3) return <h3 style={style}>{children}</h3>;
      if (level === 4) return <h4 style={style}>{children}</h4>;
      return <h2 style={style}>{children}</h2>;
    }
    case 'text': return (node.marks ?? []).reduce<ReactNode>((text, mark) => {
      switch (mark.type) {
        case 'textFormat': return <span style={documentTextStyle(mark.attrs || {})}>{text}</span>;
        case 'bold': return <strong>{text}</strong>;
        case 'italic': return <em>{text}</em>;
        case 'strike': return <s>{text}</s>;
        case 'underline': return <u>{text}</u>;
        case 'code': return <code>{text}</code>;
        case 'link': {
          const href = safeLink(mark.attrs?.href);
          return href ? <a href={href}>{text}</a> : text;
        }
        default: return text;
      }
    }, node.text);
    case 'bulletList': return <ul>{children}</ul>;
    case 'orderedList': return <ol start={typeof node.attrs?.start === 'number' ? node.attrs.start : 1}>{children}</ol>;
    case 'listItem': return <li>{children}</li>;
    case 'blockquote': return <blockquote>{children}</blockquote>;
    case 'codeBlock': return <pre><code>{children}</code></pre>;
    case 'horizontalRule': return <hr />;
    case 'hardBreak': return <br />;
    case 'image': {
      const src = mediaSource(node.attrs?.src);
      if (!src) return null;
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      const caption = typeof node.attrs?.caption === 'string' ? node.attrs.caption : '';
      return <figure data-placement={imagePlacement(node.attrs?.placement)} style={{ width: imageWidth(node.attrs?.widthPercent) + '%' }}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        {caption && <figcaption>{caption}</figcaption>}
      </figure>;
    }
    default: return null;
  }
}

export function RichDocument({ value, className = '' }: { value: unknown; className?: string }) {
  const document = readDocument(value);
  if (!hasDocumentContent(document)) return null;
  return <div className={'solar-document ' + className}>{render(document)}</div>;
}
