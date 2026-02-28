export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const target = new URL('/api/backend/api/auth/logout', req.url);
  return fetch(target, { method: 'POST' });
}

export async function OPTIONS(req: Request) {
  const target = new URL('/api/backend/api/auth/logout', req.url);
  return fetch(target, { method: 'OPTIONS' });
}
