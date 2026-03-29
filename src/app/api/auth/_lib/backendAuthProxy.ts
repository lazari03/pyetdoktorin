const DEFAULT_BACKEND_BASE_URL = 'http://localhost:4000';

function getBackendBaseUrl(): URL | null {
  const value =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_BASE_URL;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function buildBackendUrl(baseUrl: URL, path: string): URL {
  const target = new URL(baseUrl.toString());
  const normalizedBasePath = target.pathname.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  target.pathname = `${normalizedBasePath}${normalizedPath}`.replace(/\/{2,}/g, '/');
  target.search = '';
  return target;
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

export async function proxyAuthRequest(req: Request, path: string) {
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return Response.json(
      {
        error: 'BACKEND_URL_INVALID',
        message: 'NEXT_PUBLIC_BACKEND_URL/BACKEND_URL is not a valid URL.',
      },
      { status: 500 },
    );
  }

  const requestOrigin = new URL(req.url).origin;
  const normalizedBasePath = backendBaseUrl.pathname.replace(/\/+$/, '');
  if (backendBaseUrl.origin === requestOrigin && (!normalizedBasePath || normalizedBasePath === '/')) {
    return Response.json(
      {
        error: 'BACKEND_URL_MISCONFIGURED',
        message: 'NEXT_PUBLIC_BACKEND_URL/BACKEND_URL points to the Next.js app instead of the Express backend.',
      },
      { status: 500 },
    );
  }

  const method = req.method.toUpperCase();
  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  const authorization = req.headers.get('authorization');
  const cookie = req.headers.get('cookie');

  if (contentType) headers.set('content-type', contentType);
  if (authorization) headers.set('authorization', authorization);
  if (cookie) headers.set('cookie', cookie);

  try {
    const upstream = await fetch(buildBackendUrl(backendBaseUrl, path), {
      method,
      headers,
      redirect: 'manual',
      body: method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
        ? undefined
        : await req.arrayBuffer(),
    });

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
