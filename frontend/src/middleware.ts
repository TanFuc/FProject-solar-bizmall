import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('x-bmsolar-language');
  headers.delete('x-bmsolar-admin');
  if (/^\/admin(?:\/|$)/.test(request.nextUrl.pathname)) {
    headers.set('x-bmsolar-admin', '1');
    return NextResponse.next({ request: { headers } });
  }
  if (request.nextUrl.pathname === "/en" || request.nextUrl.pathname === "/en/") {
    headers.set("x-bmsolar-language", "en");
    return NextResponse.next({ request: { headers } });
  }
  const language = request.nextUrl.searchParams.get('lang');
  if (language === 'en' || language === 'vi') headers.set('x-bmsolar-language', language);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api/|_next/|images/|.*\\..*).*)'],
};
