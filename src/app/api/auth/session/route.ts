export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const target = new URL('/api/backend/api/auth/session', req.url);
  const contentType = req.headers.get('content-type') ?? 'application/json';
  const body = await req.text();
  return fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body,
  });
}

export async function OPTIONS(req: Request) {
  const target = new URL('/api/backend/api/auth/session', req.url);
  return fetch(target, { method: 'OPTIONS' });
}
