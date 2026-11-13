import type { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (!['public', 'admin'].includes(path[0] || '') || path.some(part => part === '.' || part === '..' || part.includes('/'))) {
    return new Response(null, { status: 404 });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response(null, { status: 403 });
  }
  const target = API_BASE_URL + '/' + path.map(encodeURIComponent).join('/') + request.nextUrl.search;
  const headers = new Headers();
  for (const key of ['authorization', 'content-type', 'cookie', 'if-none-match', 'idempotency-key']) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  const options: RequestInit & { duplex?: 'half' } = { method: request.method, headers, cache: 'no-store', redirect: 'manual' };
  if (request.body) Object.assign(options, { body: request.body, duplex: 'half' });
  try {
    const upstream = await fetch(target, options);
    const responseHeaders = new Headers();
    for (const key of ['content-type', 'cache-control', 'etag', 'retry-after', 'location']) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append('set-cookie', cookie);
    if (path[0] === 'admin') responseHeaders.set('cache-control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: { message: 'Backend unavailable' } }, { status: 502 });
  }
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
