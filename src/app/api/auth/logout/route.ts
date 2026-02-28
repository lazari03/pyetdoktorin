import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAMES, COOKIE_SAMESITE, isSecureCookieEnv } from '@/config/cookies';

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  return base.replace(/\/$/, '');
};

export async function POST() {
  const secure = isSecureCookieEnv();


  async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 500): Promise<Response | undefined> {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fetch(url, options);
      } catch (err) {
        lastError = err;
        console.error(`Logout fetch attempt ${attempt + 1} failed:`, err);
        if (attempt < retries - 1) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    console.error('Logout fetch failed after retries:', lastError);
    return undefined;
  }

  try {
    const backendUrl = `${getBackendBaseUrl()}/api/auth/logout`;
    await fetchWithRetry(backendUrl, { method: 'POST' });
  } catch (err) {
    // best-effort backend logout; still clear frontend cookies
    console.error('Logout fetch network error:', err);
  }

  const response = NextResponse.json({ ok: true });
  const expired = { path: '/', maxAge: 0, sameSite: COOKIE_SAMESITE, secure, httpOnly: true };
  response.cookies.set(AUTH_COOKIE_NAMES.session, '', expired);
  response.cookies.set(AUTH_COOKIE_NAMES.userRole, '', expired);
  response.cookies.set(AUTH_COOKIE_NAMES.lastActivity, '', expired);
  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
