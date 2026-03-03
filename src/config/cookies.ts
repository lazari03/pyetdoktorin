export const COOKIE_SAMESITE = 'lax' as const;

export const LANGUAGE_COOKIE_NAME = 'language';

export const ANALYTICS_CONSENT_COOKIE_NAME = 'analytics_consent';

export const AUTH_COOKIE_NAMES = {
  session: 'session',
  userRole: 'userRole',
  lastActivity: 'lastActivity',
} as const;

const ENV_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_COOKIE_DOMAIN ??
  process.env.COOKIE_DOMAIN ??
  '';

function isIpHost(hostname: string): boolean {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  // very small IPv6 heuristic (good enough for avoiding Domain= on IPs)
  if (hostname.includes(':')) return true;
  return false;
}

/**
 * Cookie Domain handling
 *
 * Browsers ALWAYS scope cookies to an origin/domain. You cannot persist consent "across all domains".
 *
 * What we *can* do:
 * - Persist across `www` + apex by setting `Domain=.example.com`
 * - Keep it host-only by omitting Domain
 *
 * Prefer setting `NEXT_PUBLIC_COOKIE_DOMAIN` / `COOKIE_DOMAIN` in production.
 * If unset, we do a conservative best-effort inference:
 * - `localhost` / IPs => no Domain attribute
 * - `www.example.com` => `.example.com`
 * - `example.com`     => `.example.com`
 */
export function getCookieDomain(hostname?: string): string | undefined {
  const configured = ENV_COOKIE_DOMAIN.trim();
  const host =
    hostname ??
    (typeof window !== 'undefined' ? window.location.hostname : undefined);

  if (configured) {
    // Safety: only apply an explicit cookie domain if it matches the current host.
    // This prevents common misconfigurations where `.env.local` contains a production cookie domain
    // (e.g. `.pyetdoktorin.al`) which would cause cookies to silently not persist on `localhost`.
    if (!host) return configured;
    const normalizedHost = host.toLowerCase();
    const normalizedDomain = configured.toLowerCase().replace(/^\.+/, '');
    if (normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`)) {
      return configured.startsWith('.') ? configured : `.${configured}`;
    }
    return undefined;
  }

  if (!host) return undefined;
  const normalized = host.toLowerCase();
  if (normalized === 'localhost') return undefined;
  if (isIpHost(normalized)) return undefined;
  if (!normalized.includes('.')) return undefined;

  if (normalized.startsWith('www.')) return `.${normalized.slice(4)}`;
  return `.${normalized}`;
}

export const AUTH_COOKIE_MAX_AGE_SECONDS = Number(
  process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE_SECONDS ??
  process.env.AUTH_COOKIE_MAX_AGE_SECONDS ??
  30 * 60
) || 30 * 60;

export function isSecureCookieEnv(): boolean {
  // Prefer runtime protocol when running in the browser.
  // This prevents accidentally setting `Secure` cookies on `http://` deployments
  // (e.g. staging, local production builds), which causes cookies to never persist.
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:';
  }

  // For server-side rendering/build-time contexts, infer from the configured site URL when available.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (typeof siteUrl === 'string' && siteUrl.length > 0) {
    return siteUrl.startsWith('https://');
  }

  return process.env.NODE_ENV === 'production';
}
