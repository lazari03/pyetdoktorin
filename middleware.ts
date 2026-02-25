import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Root-level middleware (must be at project root for Next.js to apply)
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const role = req.cookies.get('userRole')?.value;
  const hasSession = req.cookies.get('session')?.value;
  const lastActivityStr = req.cookies.get('lastActivity')?.value;
  const lastActivity = lastActivityStr ? Number(lastActivityStr) : null;
  const now = Date.now();
  const idleMs = 30 * 60 * 1000; // 30 minutes
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const isDoctorPublicPath = url.pathname === '/doctor' || url.pathname.startsWith('/doctor/');

  // Redirect authenticated users from public doctor URLs to the dashboard profile view
  if (hasSession && isDoctorPublicPath) {
    if (url.pathname === '/doctor' || url.pathname === '/doctor/') {
      url.pathname = '/dashboard';
    } else {
      url.pathname = `/dashboard${url.pathname}`;
    }
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  // Admins should land on /admin, others on /dashboard
  // Require both auth token AND role cookie to reduce false positives from stale tokens
  if (hasSession && role && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    // If admin tries to access dashboard, redirect them to admin home
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

    // Redirect immediately if no auth token
    if (!hasSession) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Allow while role is loading client-side
    if (hasSession && !role) {
      return NextResponse.next();
    }

    if (hasSession && role) {
      // Allow both doctors and patients to view doctor profiles
      if (url.pathname.startsWith('/dashboard/doctor') && !(role === 'doctor' || role === 'patient')) {
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

  // Protect clinic routes
  if (url.pathname.startsWith('/clinic')) {
    if (!hasSession) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'clinic') {
      url.pathname = role === 'pharmacy' ? '/pharmacy' : '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes: require role=admin
  if (url.pathname.startsWith('/admin')) {
    if (!hasSession) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Pass language header for SSR
  const lang = req.cookies.get('language')?.value || 'en';
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  res.headers.set('x-language', lang);
  res.headers.set('x-nonce', nonce);
  // Refresh lastActivity cookie while navigating SSR paths (sliding window)
  if (hasSession) {
    res.cookies.set('lastActivity', String(now), { path: '/', sameSite: 'lax', maxAge: 30 * 60 });
    res.cookies.set('loggedIn', '1', { path: '/', sameSite: 'lax', maxAge: 30 * 60 });
  }
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/clinic/:path*', '/doctor/:path*', '/login', '/register'],
};
