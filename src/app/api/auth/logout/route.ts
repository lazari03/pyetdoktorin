import { NextResponse } from 'next/server';

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  return base.replace(/\/$/, '');
};

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd;

  try {
    const backendUrl = `${getBackendBaseUrl()}/api/auth/logout`;
    await fetch(backendUrl, { method: 'POST' }).catch(() => undefined);
  } catch {
    // best-effort backend logout; still clear frontend cookies
  }

  const response = NextResponse.json({ ok: true });
  const expired = { path: '/', maxAge: 0, sameSite: 'lax' as const, secure };
  response.cookies.set('session', '', { ...expired, httpOnly: true });
  response.cookies.set('userRole', '', expired);
  response.cookies.set('lastActivity', '', expired);
  response.cookies.set('loggedIn', '', expired);
  return response;
}
