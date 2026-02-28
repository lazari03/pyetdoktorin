import { COOKIE_SAMESITE, LANGUAGE_COOKIE_NAME, isSecureCookieEnv } from "@/config/cookies";

export function setLanguageCookie(value: string, maxAgeSeconds = 31536000) {
  if (typeof document === "undefined") return;
  const secureAttr = isSecureCookieEnv() ? "; Secure" : "";
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${maxAgeSeconds}${secureAttr}`;
}

export function getLanguageCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + LANGUAGE_COOKIE_NAME + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}
