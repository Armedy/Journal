import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('journal_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // 1. If no session and not on login page, redirect to login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If session exists, reset the 10-minute timer (Sliding Session)
  if (session && !isLoginPage) {
    const response = NextResponse.next();
    response.cookies.set('journal_session', 'authenticated', {
      httpOnly: true,
      maxAge: 600, // Reset to 10 minutes
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};