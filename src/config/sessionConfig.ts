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
