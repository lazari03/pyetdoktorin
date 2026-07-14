export const SESSION_IDLE_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MS ??
  process.env.SESSION_IDLE_TIMEOUT_MS ??
  30 * 60 * 1000
) || 30 * 60 * 1000;

export const SESSION_REFRESH_THROTTLE_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_REFRESH_THROTTLE_MS ??
  process.env.SESSION_REFRESH_THROTTLE_MS ??
  60 * 1000
) || 60 * 1000;

export const SESSION_LAST_ACTIVITY_KEY = 'session:lastActivity';

// How often to re-mint the httpOnly server session cookie while the user is
// active. Must be comfortably below AUTH_COOKIE_MAX_AGE_SECONDS (30 min) so
// the absolute cookie expiry never fires for an active user.
export const SESSION_COOKIE_REFRESH_MS = Number(
  process.env.NEXT_PUBLIC_SESSION_COOKIE_REFRESH_MS ??
  process.env.SESSION_COOKIE_REFRESH_MS ??
  10 * 60 * 1000
) || 10 * 60 * 1000;
