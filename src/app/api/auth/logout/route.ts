export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { proxyAuthRequest } from '@/app/api/auth/_lib/backendAuthProxy';

export async function POST(req: Request) {
  return proxyAuthRequest(req, '/api/auth/logout');
}

export async function OPTIONS(req: Request) {
  return proxyAuthRequest(req, '/api/auth/logout');
}
