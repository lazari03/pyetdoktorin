export const COOKIE_SAMESITE = 'lax' as const;

export const LANGUAGE_COOKIE_NAME = 'language';

export const AUTH_COOKIE_NAMES = {
  session: 'session',
  userRole: 'userRole',
  lastActivity: 'lastActivity',
} as const;

export const AUTH_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE_SECONDS ??
  process.env.AUTH_COOKIE_MAX_AGE_SECONDS ??
  30 * 60
) || 30 * 60;

export function isSecureCookieEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}
