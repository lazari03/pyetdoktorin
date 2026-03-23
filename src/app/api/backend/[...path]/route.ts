export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getBackendOrigin(): string {
  const value =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:4000';

  try {
    return new URL(value).origin;
  } catch {
    return 'http://localhost:4000';
  }
}

function buildTargetUrl(req: Request, path: string[]): URL {
  const url = new URL(req.url);
  const pathname = path.map(encodeURIComponent).join('/');
  const normalizedPathname = pathname.startsWith('api/')
    ? `/${pathname}`
    : `/api/${pathname}`;
  const target = new URL(`${normalizedPathname}${url.search}`, getBackendOrigin());
  return target;
}

function cloneRequestHeaders(req: Request): Headers {
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

function cloneResponseHeaders(upstream: Response): Headers {
  const headers = new Headers(upstream.headers);
  headers.delete('content-length');
  headers.delete('set-cookie');

  const getSetCookie = (
    upstream.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;
  if (typeof getSetCookie === 'function') {
    for (const value of getSetCookie.call(upstream.headers)) {
      headers.append('set-cookie', value);
    }
  }

  return headers;
}

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const method = req.method.toUpperCase();
  const target = buildTargetUrl(req, path);
  const headers = cloneRequestHeaders(req);
  const init: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    body: method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer(),
  };

  try {
    const upstream = await fetch(target, init);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: cloneResponseHeaders(upstream),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return Response.json(
      { error: 'BACKEND_PROXY_ERROR', message },
      { status: 502 },
    );
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function OPTIONS(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function HEAD(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
