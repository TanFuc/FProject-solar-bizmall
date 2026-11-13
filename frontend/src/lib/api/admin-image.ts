import { object } from './blocks';
import { mediaSource } from './content-body';

export async function uploadAdminImage(file: File, getToken: () => Promise<string>) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Chọn ảnh JPEG, PNG hoặc WebP.');
  if (!file.size || file.size > 25 * 1024 * 1024) throw new Error('Ảnh cần có dung lượng từ 1 byte đến 25 MB.');
  const token = await getToken();
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/admin/editor-media', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body });
  const result: unknown = await response.json();
  const data = object(result) && object(result.data) ? result.data : null;
  const url = mediaSource(data?.url);
  if (!response.ok || !data || typeof data.id !== 'string' || !url) {
    const message = object(result) && object(result.error) && result.error.message;
    throw new Error(typeof message === 'string' ? message : 'Không tải được ảnh.');
  }
  return { id: data.id, url };
}
