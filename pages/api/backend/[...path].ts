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

  // Copy headers (preserve multi-value Set-Cookie).
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    if (key.toLowerCase() === 'transfer-encoding') return;
    if (key.toLowerCase() === 'etag') return;
    if (key.toLowerCase() === 'cache-control') return;
    res.setHeader(key, value);
  });

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

  const arrayBuffer = await backendRes.arrayBuffer();
  res.send(Buffer.from(arrayBuffer));
}
