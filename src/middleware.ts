import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const role = req.cookies.get('userRole')?.value; // Assuming role is stored in cookies

  if (url.pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/doctor/:path*'], // Apply middleware to doctor-specific paths
};
