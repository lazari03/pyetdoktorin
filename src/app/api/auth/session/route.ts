import { NextResponse } from 'next/server';

const splitSetCookie = (header: string): string[] => {
  if (!header) return [];
  return header.split(/,(?=[^;]+=[^;]+)/g).map((item) => item.trim()).filter(Boolean);
};

const getBackendBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:4000';
  return base.replace(/\/$/, '');
};

export async function POST(req: Request) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }


    const backendUrl = `${getBackendBaseUrl()}/api/auth/session`;

    async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 500): Promise<Response> {
      let lastError: unknown;
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          return await fetch(url, options);
        } catch (err) {
          lastError = err;
          console.error(`Session fetch attempt ${attempt + 1} failed:`, err);
          if (attempt < retries - 1) {
            await new Promise((res) => setTimeout(res, delay));
          }
        }
      }
      throw lastError;
    }

    let backendRes: Response;
    try {
      backendRes = await fetchWithRetry(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (err) {
      console.error('Session fetch network error:', err);
      return NextResponse.json({ error: 'Network error: ' + (err instanceof Error ? err.message : String(err)) }, { status: 502 });
    }

    const text = await backendRes.text();
    const data = text ? (JSON.parse(text) as { ok?: boolean; role?: string; error?: string }) : {};

    if (!backendRes.ok) {
      console.error('Session fetch error response:', backendRes.status, text);
      return NextResponse.json({ error: data?.error || 'Failed to establish session' }, { status: backendRes.status });
    }

    const role = data?.role || 'patient';
    const response = NextResponse.json({ ok: true, role });

    const setCookie = (backendRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
    const rawSetCookie = backendRes.headers.get('set-cookie');
    const cookies = setCookie && setCookie.length ? setCookie : rawSetCookie ? splitSetCookie(rawSetCookie) : [];
    cookies.forEach((cookie) => response.headers.append('Set-Cookie', cookie));

    return response;
  } catch (error) {
    console.error('Session proxy error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
