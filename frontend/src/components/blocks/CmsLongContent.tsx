import { RichDocument } from '@/components/ui/RichDocument';
import type { CMSBlock } from '@/types/bmsolar-api';

export function CmsLongContent({ blocks }: { blocks: CMSBlock[] }) {
  const documents = blocks.filter(block => block.enabled && block.type === 'richText' && block.data.document);
  if (!documents.length) return null;
  return <div className="solar-long-content solar-container">
    {documents.map(block => <RichDocument key={block.id} value={block.data.document} className="solar-document-column" />)}
  </div>;
}
