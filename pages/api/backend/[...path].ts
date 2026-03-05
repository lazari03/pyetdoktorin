import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const backendBaseUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:4000';

const normalizeBaseUrl = (base: string) => base.replace(/\/$/, '');

function looksLikeJsonText(payload: Buffer): boolean {
  let i = 0;
  // UTF-8 BOM
  if (payload.length >= 3 && payload[0] === 0xef && payload[1] === 0xbb && payload[2] === 0xbf) i = 3;
  while (i < payload.length) {
    const b = payload[i];
    // whitespace (space/tab/newline/cr)
    if (b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d) {
      i += 1;
      continue;
    }
    return b === 0x7b /* { */ || b === 0x5b /* [ */;
  }
  return false;
}

async function readRawBody(req: NextApiRequest): Promise<ArrayBuffer> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  const buffer = Buffer.concat(chunks);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

const toHeaderRecord = (headers: NextApiRequest['headers']): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    out[key] = Array.isArray(value) ? value.join(',') : value;
  }
  return out;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const base = normalizeBaseUrl(backendBaseUrl);
  const pathParts = (req.query.path ?? []) as string[] | string;
  const path = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');

  const url = new URL(`${base}/${path}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, value);
    }
  }

  const method = (req.method || 'GET').toUpperCase();
  const headers = toHeaderRecord(req.headers);
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];
  // Avoid proxying compressed payloads since Node fetch may transparently decode them.
  // If we forward a decoded body while also forwarding `content-encoding`, browsers can fail to decode.
  headers['accept-encoding'] = 'identity';
  // Prevent conditional requests that can return 304 and lead to stale UI data in dashboards.
  delete headers['if-none-match'];
  delete headers['if-modified-since'];
  delete headers['if-match'];
  delete headers['if-unmodified-since'];
  delete headers['if-range'];

  const body: ArrayBuffer | undefined =
    method === 'GET' || method === 'HEAD' || method === 'OPTIONS' ? undefined : await readRawBody(req);

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
    res.status(502).json({
      error: 'Backend unreachable',
      detail: process.env.NODE_ENV !== 'production' ? message : undefined,
    });
    return;
  }

  res.status(backendRes.status);

  const contentType = backendRes.headers.get('content-type') || '';
  const arrayBuffer = await backendRes.arrayBuffer();
  const payload = Buffer.from(arrayBuffer);

  // Avoid browser caching for authenticated API data (prevents 304/stale lists in dashboards).
  res.setHeader('Cache-Control', 'no-store');

  const headerWithGetSetCookie = backendRes.headers as unknown as { getSetCookie?: () => string[] };
  const setCookies = headerWithGetSetCookie.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    res.setHeader('Set-Cookie', setCookies);
  } else {
    const single = backendRes.headers.get('set-cookie');
    if (single) res.setHeader('Set-Cookie', single);
  }

  // This proxy is intended for JSON API responses only.
  // Avoid streaming arbitrary backend payloads to the browser to prevent reflected HTML/XSS risks.
  const isJson = contentType.toLowerCase().includes('application/json') || looksLikeJsonText(payload);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (backendRes.status === 204) {
    res.end();
    return;
  }

  if (!isJson) {
    const detail =
      process.env.NODE_ENV !== 'production'
        ? { contentType, sample: payload.toString('utf8').slice(0, 200) }
        : { contentType };
    res.status(502).json({ error: 'Unexpected backend response type', ...detail });
    return;
  }

  const text = payload.toString('utf8');
  if (!text) {
    res.json({});
    return;
  }

  try {
    res.json(JSON.parse(text));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(502).json({
      error: 'Invalid JSON from backend',
      detail: process.env.NODE_ENV !== 'production' ? { message } : undefined,
    });
  }
}
