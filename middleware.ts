import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAMES, COOKIE_SAMESITE, LANGUAGE_COOKIE_NAME, isSecureCookieEnv } from '@/config/cookies';
import { ROUTES } from '@/config/routes';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { getRoleLandingPath } from '@/navigation/roleRoutes';

// Root-level middleware (must be at project root for Next.js to apply)
function createNonce(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  // `btoa` is available in the middleware runtime.
  return btoa(binary);
}

function buildCsp({ nonce, reportOnly }: { nonce: string; reportOnly: boolean }): string {
  const directives: string[] = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    // Report-only first; enforcement can be enabled later once all inline scripts/styles are migrated.
    // Keep unsafe-inline/eval for now to avoid breaking Next.js/runtime behavior.
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss: http:",
    "frame-src 'self' https:",
    "object-src 'none'",
    "report-uri /api/csp-report",
  ];

  // Reporting API v1-style endpoint (supported by some browsers).
  directives.push('report-to csp');

  // In enforcement mode, keep parity with report-only policy for now (no surprise breaks).
  // The next tightening step is to remove unsafe-inline/unsafe-eval once everything is nonced/hashed.
  if (!reportOnly) {
    directives.push("frame-ancestors 'self'");
  }

  return directives.join('; ');
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && forwardedProto === 'http') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }
  const rawRole = req.cookies.get(AUTH_COOKIE_NAMES.userRole)?.value;
  const role = normalizeRole(rawRole);
  const hasSession = req.cookies.get(AUTH_COOKIE_NAMES.session)?.value;
  const lastActivityStr = req.cookies.get(AUTH_COOKIE_NAMES.lastActivity)?.value;
  const lastActivity = lastActivityStr ? Number(lastActivityStr) : null;
  const now = Date.now();
  const idleMs = 30 * 60 * 1000; // 30 minutes
  const nonce = createNonce();
  const secureCookie = isSecureCookieEnv();

  const isDoctorPublicPath = url.pathname === '/doctor' || url.pathname.startsWith('/doctor/');
  const isProtectedPath =
    url.pathname.startsWith(ROUTES.DASHBOARD) ||
    url.pathname.startsWith(ROUTES.CLINIC) ||
    url.pathname.startsWith(ROUTES.PHARMACY) ||
    url.pathname.startsWith(ROUTES.ADMIN);

  // Redirect authenticated users from public doctor URLs to the dashboard profile view
  if (hasSession && isDoctorPublicPath) {
    if (url.pathname === '/doctor' || url.pathname === '/doctor/') {
      url.pathname = ROUTES.DASHBOARD;
    } else {
      url.pathname = `${ROUTES.DASHBOARD}${url.pathname}`;
    }
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  // Admins should land on /admin, others on /dashboard
  // Require both auth token AND role cookie to reduce false positives from stale tokens
  if (hasSession && role && (url.pathname === ROUTES.LOGIN || url.pathname === ROUTES.REGISTER)) {
    url.pathname = getRoleLandingPath(role);
    return NextResponse.redirect(url);
  }

  // Enforce idle timeout for any protected area if we have a timestamp.
  // (Avoids "logged out but stuck loading" on non-dashboard sections.)
  if (isProtectedPath && hasSession && lastActivity && now - lastActivity > idleMs) {
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set('reason', 'idle-timeout');
    const res = NextResponse.redirect(url);
    // Clear session cookies
    res.cookies.set(AUTH_COOKIE_NAMES.session, '', { path: '/', maxAge: 0, httpOnly: true, secure: secureCookie });
    res.cookies.set(AUTH_COOKIE_NAMES.userRole, '', { path: '/', maxAge: 0, httpOnly: true, secure: secureCookie });
    res.cookies.set(AUTH_COOKIE_NAMES.lastActivity, '', { path: '/', maxAge: 0, httpOnly: true, secure: secureCookie });
    return res;
  }

  // Protect dashboard routes
  if (url.pathname.startsWith(ROUTES.DASHBOARD)) {
    // If admin tries to access dashboard, redirect them to admin home
    if (hasSession && role === UserRole.Admin) {
      url.pathname = ROUTES.ADMIN;
      return NextResponse.redirect(url);
    }

    // Redirect immediately if no auth token
    if (!hasSession) {
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Allow while role is loading client-side (avoid redirect loops right after login).
    if (hasSession && role) {
      // Allow both doctors and patients to view doctor profiles
      if (url.pathname.startsWith(`${ROUTES.DASHBOARD}/doctor`) && !(role === UserRole.Doctor || role === UserRole.Patient)) {
        url.pathname = ROUTES.DASHBOARD;
        return NextResponse.redirect(url);
      }
      // Patient-only routes
      if (url.pathname.startsWith(`${ROUTES.DASHBOARD}/search`) && role !== UserRole.Patient) {
        url.pathname = ROUTES.DASHBOARD;
        return NextResponse.redirect(url);
      }
    }
  }

  // Protect clinic routes
  if (url.pathname.startsWith(ROUTES.CLINIC)) {
    if (!hasSession) {
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    // Allow while role is loading client-side (avoid redirect loops right after login).
    if (!role) {
      // fall through
    } else if (role !== UserRole.Clinic) {
      url.pathname = getRoleLandingPath(role);
      return NextResponse.redirect(url);
    }
  }

  // Protect pharmacy routes: require role=pharmacy
  if (url.pathname.startsWith(ROUTES.PHARMACY)) {
    if (!hasSession) {
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    // Allow while role is loading client-side (avoid redirect loops right after login).
    if (!role) {
      // fall through
    } else if (role !== UserRole.Pharmacy) {
      url.pathname = getRoleLandingPath(role);
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes: require role=admin
  if (url.pathname.startsWith(ROUTES.ADMIN)) {
    if (!hasSession) {
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    // Allow while role is loading client-side (avoid redirect loops right after login).
    if (!role) {
      // fall through
    } else if (role !== UserRole.Admin) {
      url.pathname = getRoleLandingPath(role);
      return NextResponse.redirect(url);
    }
  }

  // Pass language header for SSR
  const lang = req.cookies.get(LANGUAGE_COOKIE_NAME)?.value || 'en';
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-language', lang);
  requestHeaders.set('x-nonce', nonce);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set('x-language', lang);
  res.headers.set('x-nonce', nonce);

  if (process.env.NODE_ENV === 'production') {
    const reportOnly = buildCsp({ nonce, reportOnly: true });
    res.headers.set('Content-Security-Policy-Report-Only', reportOnly);
    res.headers.set('Reporting-Endpoints', 'csp="/api/csp-report"');
    // Optional enforcement toggle (keep report-only as default).
    if (process.env.CSP_ENFORCE === 'true') {
      res.headers.set('Content-Security-Policy', buildCsp({ nonce, reportOnly: false }));
    }
  }

  // Refresh lastActivity cookie while navigating SSR paths (sliding window)
  if (hasSession) {
    res.cookies.set(AUTH_COOKIE_NAMES.lastActivity, String(now), {
      path: '/',
      sameSite: COOKIE_SAMESITE,
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: secureCookie,
    });
  }
  return res;
}

export const config = {
  // Apply to all non-asset, non-API routes so we can consistently provide
  // request-scoped headers like `x-language` and `x-nonce` for SSR.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
