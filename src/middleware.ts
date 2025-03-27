import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const VALID_API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Store securely in environment variables
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN; // Your app's domain
const SHARED_SECRET = process.env.NEXT_PUBLIC_SHARED_SECRET; // Shared secret for signing requests

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is an API route
  if (path.startsWith('/api')) {
    const apiKey = request.headers.get('x-api-key');
    const origin = request.headers.get('origin');
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');

    // Validate API Key
    if (!apiKey || apiKey !== VALID_API_KEY) {
      console.log('Invalid or missing API key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate Origin Header
    if (!origin || origin !== ALLOWED_ORIGIN) {
      console.log('Invalid or missing Origin header');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate Signature
    if (!signature || !timestamp) {
      console.log('Missing signature or timestamp');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', SHARED_SECRET || '')
      .update(`${timestamp}:${path}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('Invalid signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Check for protected routes
  const isProtectedRoute = path.startsWith('/dashboard');
  const authToken = request.cookies.get('auth-token')?.value;

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
