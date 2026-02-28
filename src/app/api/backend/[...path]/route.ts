import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const backendBaseUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:4000';

const normalizeBaseUrl = (base: string) => base.replace(/\/$/, '');

const splitSetCookie = (header: string): string[] => {
  if (!header) return [];
  return header
    .split(/,(?=[^;]+=[^;]+)/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const base = normalizeBaseUrl(backendBaseUrl);
  const path = params.path.join('/');
  const url = new URL(`${base}/${path}`);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const method = req.method.toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  let backendRes: Response;
  try {
    backendRes = await fetch(url.toString(), {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== 'production') {
      console.error('Backend proxy fetch failed', { url: url.toString(), method, message });
    }
    return NextResponse.json(
      { error: 'Backend unreachable', detail: process.env.NODE_ENV !== 'production' ? message : undefined },
      { status: 502 }
    );
  }

  // Copy all headers except Set-Cookie (which can appear multiple times).
  const responseHeaders = new Headers();
  for (const [key, value] of backendRes.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') continue;
    responseHeaders.set(key, value);
  }
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-encoding');

  const response = new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });

  // Preserve all Set-Cookie headers from the backend response.
  // Prefer Next's cookie API so it emits correct multi-Set-Cookie headers.
  const headerWithGetSetCookie = backendRes.headers as unknown as { getSetCookie?: () => string[] };
  const setCookies =
    headerWithGetSetCookie.getSetCookie?.() ??
    (backendRes.headers.get('set-cookie') ? splitSetCookie(backendRes.headers.get('set-cookie') || '') : []);
  const parseCookie = (cookie: string) => {
    const parts = cookie.split(';').map((part) => part.trim());
    const [nameValue, ...attrs] = parts;
    const [name, ...valueParts] = nameValue.split('=');
    const value = valueParts.join('=');
    const options: {
      path?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      maxAge?: number;
    } = {};
    for (const attr of attrs) {
      const [attrNameRaw, attrValue] = attr.split('=');
      const lower = (attrNameRaw || '').toLowerCase();
      if (lower === 'httponly') options.httpOnly = true;
      if (lower === 'secure') options.secure = true;
      if (lower === 'path') options.path = attrValue || '/';
      if (lower === 'samesite') {
        const normalized = (attrValue || '').toLowerCase();
        if (normalized === 'lax' || normalized === 'strict' || normalized === 'none') {
          options.sameSite = normalized;
        }
      }
      if (lower === 'max-age') {
        const parsed = Number(attrValue);
        if (Number.isFinite(parsed)) options.maxAge = parsed;
      }
    }
    return { name, value, options };
  };

  for (const cookie of setCookies) {
    const parsed = parseCookie(cookie);
    if (!parsed.name) continue;
    response.cookies.set(parsed.name, parsed.value, parsed.options);
  }

  return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, await context.params);
}
