import { NextResponse } from 'next/server';

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  return base.replace(/\/$/, '');
};

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd;


  async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 500): Promise<Response | undefined> {
    let lastError: any;
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
  const expired = { path: '/', maxAge: 0, sameSite: 'lax' as const, secure };
  response.cookies.set('session', '', { ...expired, httpOnly: true });
  response.cookies.set('userRole', '', expired);
  response.cookies.set('lastActivity', '', expired);
  response.cookies.set('loggedIn', '', expired);
  return response;
}
