import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const authToken = req.cookies.get('auth-token');

    // Redirect to login if no auth token is found
    if (!authToken) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Allow the request to proceed if authenticated
    return NextResponse.next();
}

// Apply middleware to all routes except public ones
export const config = {
    matcher: ['/dashboard/:path*', '/protected/:path*'], // Protect specific paths
};
