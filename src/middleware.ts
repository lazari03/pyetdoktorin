import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const role = req.cookies.get('userRole')?.value;

  // Protect all dashboard routes
  if (url.pathname.startsWith('/dashboard') && !role) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Doctor-only protection (only check if authenticated)
  if (
    url.pathname.startsWith('/dashboard/doctor') &&
    role && // user is authenticated
    role !== 'doctor'
  ) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

// No changes needed here; middleware is for route protection, not client-side cleanup.
// Place the cleanup logic in your appointments page or the page you land on after leaving the call.
