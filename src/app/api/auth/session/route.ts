export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAppOrigin(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).origin;
    } catch {
      // ignore malformed env value
    }
  }
  return 'http://localhost:3000';
}

export async function POST(req: Request) {
  const target = new URL('/api/backend/api/auth/session', getAppOrigin());
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

export async function OPTIONS(_req: Request) {
  const target = new URL('/api/backend/api/auth/session', getAppOrigin());
  return fetch(target, { method: 'OPTIONS' });
}
