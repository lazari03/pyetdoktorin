import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { SignJWT } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verify the Firebase ID token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch  {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Create a JWT for your own session (with user info)
    // Use a strong JWT secret in production! Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set. Please set a strong secret.');
    }
    const encoder = new TextEncoder();
    const alg = 'HS256';
    const sessionJwt = await new SignJWT({
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'user',
    })
      .setProtectedHeader({ alg })
      .setExpirationTime('30m')
      .sign(encoder.encode(jwtSecret));

    const isProd = process.env.NODE_ENV === 'production';
    const cookie = [
      `session=${sessionJwt}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${30 * 60}`,
      isProd ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch  {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
