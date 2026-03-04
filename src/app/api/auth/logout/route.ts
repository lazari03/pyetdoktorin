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

export async function POST(_req: Request) {
  const target = new URL('/api/backend/api/auth/logout', getAppOrigin());
  return fetch(target, { method: 'POST' });
}

export async function OPTIONS(_req: Request) {
  const target = new URL('/api/backend/api/auth/logout', getAppOrigin());
  return fetch(target, { method: 'OPTIONS' });
}
