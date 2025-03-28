import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Store securely in environment variables
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN; // Your app's domain
const SHARED_SECRET = process.env.NEXT_PUBLIC_SHARED_SECRET; // Shared secret for signing requests

async function verifySignature(path: string, timestamp: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SHARED_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(`${timestamp}:${path}`);
  const expectedSignature = await crypto.subtle.sign('HMAC', key, data);
  const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return signature === expectedSignatureHex;
}

export async function middleware(request: NextRequest) {
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

    const isValidSignature = await verifySignature(path, timestamp, signature);
    if (!isValidSignature) {
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
