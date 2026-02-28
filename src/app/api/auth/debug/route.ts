import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAMES } from '@/config/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }
  const jar = await cookies();
  const session = jar.get(AUTH_COOKIE_NAMES.session)?.value ?? null;
  const role = jar.get(AUTH_COOKIE_NAMES.userRole)?.value ?? null;
  const lastActivity = jar.get(AUTH_COOKIE_NAMES.lastActivity)?.value ?? null;
  return NextResponse.json({
    hasSession: Boolean(session),
    hasRole: Boolean(role),
    role: role ? decodeURIComponent(role) : null,
    hasLastActivity: Boolean(lastActivity),
  });
}

