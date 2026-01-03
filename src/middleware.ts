import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const role = req.cookies.get('userRole')?.value;
  const hasSession = req.cookies.get('session')?.value;
  const lastActivityStr = req.cookies.get('lastActivity')?.value;
  const lastActivity = lastActivityStr ? Number(lastActivityStr) : null;
  const now = Date.now();
  const idleMs = 30 * 60 * 1000; // 30 minutes

  // Redirect authenticated users away from auth pages
  if (hasSession && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    // Redirect admins away from dashboard to admin area
    if (hasSession && role === 'admin') {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    // Enforce idle timeout on server side if we have a timestamp
    if (hasSession && lastActivity && now - lastActivity > idleMs) {
      url.pathname = '/login';
      url.searchParams.set('reason', 'idle-timeout');
      const res = NextResponse.redirect(url);
      // Clear session cookies
      res.cookies.set('session', '', { path: '/', maxAge: 0, httpOnly: true });
      res.cookies.set('userRole', '', { path: '/', maxAge: 0 });
      res.cookies.set('lastActivity', '', { path: '/', maxAge: 0 });
      res.cookies.set('loggedIn', '', { path: '/', maxAge: 0 });
      return res;
    }

    // If no session, redirect to login immediately
    if (!hasSession) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // If has session but no role yet, allow through (AuthContext will set it)
    if (hasSession && !role) {
      return NextResponse.next();
    }

    // Role-based protection
    if (hasSession && role) {
      // Doctor-only routes
      if (url.pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      
      // Patient-only routes
      if (url.pathname.startsWith('/dashboard/search') && role !== 'patient') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  const lang = req.cookies.get('language')?.value || 'en';
  const response = NextResponse.next();
  response.headers.set('x-language', lang);
  if (hasSession) {
    response.cookies.set('lastActivity', String(now), { path: '/', sameSite: 'lax', maxAge: 30 * 60 });
    response.cookies.set('loggedIn', '1', { path: '/', sameSite: 'lax', maxAge: 30 * 60 });
  }
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
