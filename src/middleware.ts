import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    const protectedRoutes = ['/dashboard', '/profile'];

    const { pathname } = request.nextUrl;

    // Allow public routes without authentication
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for auth-token in cookies for protected routes
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      const authToken = request.cookies.get('auth-token');
      if (!authToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname); // Redirect back after login
        return NextResponse.redirect(loginUrl);
      }

      // Set custom header to indicate user is authenticated
      const response = NextResponse.next();
      response.headers.set('x-user-authenticated', 'true');
      return response;
    }

    // Allow all other requests
    const response = NextResponse.next();
    response.headers.set('x-user-authenticated', 'false');
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // Protect these routes
};