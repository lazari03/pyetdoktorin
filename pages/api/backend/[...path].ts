import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const normalizeBaseUrl = (base: string) => base.replace(/\/$/, '');

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendBaseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:4000';

  const incomingUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathParts = req.query.path;
  const path = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');

  const target = new URL(`${normalizeBaseUrl(backendBaseUrl)}/${path}`);
  target.search = incomingUrl.search;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    headers[key] = Array.isArray(value) ? value.join(',') : value;
  }
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];

  const method = (req.method || 'GET').toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await readRawBody(req);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      redirect: 'manual',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(502).json({ error: 'Backend unreachable', detail: message });
  }

  // Copy headers (except Set-Cookie which can appear multiple times).
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    if (key.toLowerCase() === 'transfer-encoding') return;
    res.setHeader(key, value);
  });

  const headerWithGetSetCookie = upstream.headers as unknown as { getSetCookie?: () => string[] };
  const setCookies = headerWithGetSetCookie.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    res.setHeader('set-cookie', setCookies);
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.status(upstream.status).send(buffer);
}

