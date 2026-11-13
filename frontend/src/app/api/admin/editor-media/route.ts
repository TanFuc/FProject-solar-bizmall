import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Hãy đăng nhập quản trị.' } }, { status: 401 });
  }
  if (!request.body || !contentType?.startsWith('multipart/form-data;')) {
    return NextResponse.json({ error: { message: 'Yêu cầu phải chứa một tệp ảnh.' } }, { status: 400 });
  }
  const options: RequestInit & { duplex: 'half' } = {
    method: 'POST', headers: { authorization, 'Content-Type': contentType },
    body: request.body, duplex: 'half', cache: 'no-store', redirect: 'error',
  };
  try {
    const upstream = await fetch(API_BASE_URL + '/admin/media/upload', options);
    return new Response(upstream.body, { status: upstream.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return NextResponse.json({ error: { message: 'Không kết nối được thư viện ảnh.' } }, { status: 502 });
  }
}
