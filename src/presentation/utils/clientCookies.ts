import { COOKIE_SAMESITE, LANGUAGE_COOKIE_NAME, getCookieDomain, isSecureCookieEnv } from "@/config/cookies";

export function setLanguageCookie(value: string, maxAgeSeconds = 31536000) {
  if (typeof document === "undefined") return;
  const secureAttr = isSecureCookieEnv() ? "; Secure" : "";
  const domain = getCookieDomain();
  const domainAttr = domain ? `; Domain=${domain}` : "";
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${maxAgeSeconds}; Expires=${expires}${domainAttr}${secureAttr}`;
}

export function getLanguageCookie(): string | null {
  if (typeof document === "undefined") return null;
  // Cookie separators are usually "; " but some environments omit the space.
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + LANGUAGE_COOKIE_NAME + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}
