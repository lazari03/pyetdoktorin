import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard)
  const path = request.nextUrl.pathname;
  
  // Check if the path is a protected route (starts with /dashboard)
  const isProtectedRoute = path.startsWith('/dashboard');
  
  // Get the authentication token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  console.log(`Middleware checking path: ${path}`);
  console.log(`Auth token exists: ${!!authToken}`);
  
  // If trying to access a protected route and not authenticated, redirect to login
  if (isProtectedRoute && !authToken) {
    console.log('Redirecting to login due to missing auth token');
    const loginUrl = new URL('/login', request.url);
    // You can also add a "from" parameter to redirect back after login
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all dashboard routes
    '/dashboard/:path*',
  ],
};
