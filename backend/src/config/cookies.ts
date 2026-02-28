export const COOKIE_SAMESITE = 'Lax';

export const AUTH_COOKIE_NAMES = {
  session: 'session',
  userRole: 'userRole',
  lastActivity: 'lastActivity',
} as const;

export const AUTH_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? 30 * 60
) || 30 * 60;

export function buildAuthCookie({
  name,
  value,
  isProd,
  httpOnly = true,
  maxAgeSeconds = AUTH_COOKIE_MAX_AGE_SECONDS,
}: {
  name: string;
  value: string;
  isProd: boolean;
  httpOnly?: boolean;
  maxAgeSeconds?: number;
}) {
  const secure = isProd ? '; Secure' : '';
  const httpOnlyFlag = httpOnly ? '; HttpOnly' : '';
  return `${name}=${value}; Path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${maxAgeSeconds}${httpOnlyFlag}${secure}`;
}

export function buildExpiredCookie(name: string, isProd: boolean) {
  const secure = isProd ? '; Secure' : '';
  return `${name}=; Path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=0; HttpOnly${secure}`;
}
