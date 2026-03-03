import { ANALYTICS_CONSENT_COOKIE_NAME, COOKIE_SAMESITE, getCookieDomain, isSecureCookieEnv } from "@/config/cookies";

export type AnalyticsConsentValue = "granted" | "denied" | "unset";

const CONSENT_EVENT = "analytics_consent_changed";
const CONSENT_STORAGE_KEY = ANALYTICS_CONSENT_COOKIE_NAME;
const CONSENT_SESSION_KEY = `${ANALYTICS_CONSENT_COOKIE_NAME}_session`;
const CONSENT_TTL_SECONDS = 60 * 60 * 24;
let memoryConsent: AnalyticsConsentValue = "unset";
let memoryExpiresAt = 0;

type StoredConsentPayload = { v: Exclude<AnalyticsConsentValue, "unset">; exp: number };

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  // Cookie separators are usually "; " but some environments omit the space.
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function parseStoredConsent(raw: string | null): Exclude<AnalyticsConsentValue, "unset"> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsentPayload>;
    if (parsed?.v !== "granted" && parsed?.v !== "denied") return null;
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) return null;
    if (Date.now() >= parsed.exp) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

function getStorageValue(name: string): Exclude<AnalyticsConsentValue, "unset"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(name);
    // Migration: older versions stored just the raw string without an expiry.
    // Keep the preference but rewrite it with the current TTL policy.
    if (raw === "granted" || raw === "denied") {
      setStorage(name, raw, CONSENT_TTL_SECONDS);
      return raw;
    }
    return parseStoredConsent(raw);
  } catch {
    return null;
  }
}

function getSessionValue(name: string): Exclude<AnalyticsConsentValue, "unset"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(name);
    if (raw === "granted" || raw === "denied") {
      setSession(name, raw, CONSENT_TTL_SECONDS);
      return raw;
    }
    return parseStoredConsent(raw);
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secureAttr = isSecureCookieEnv() ? "; Secure" : "";
  const domain = getCookieDomain();
  const domainAttr = domain ? `; Domain=${domain}` : "";
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${maxAgeSeconds}; Expires=${expires}${domainAttr}${secureAttr}`;
}

function setStorage(name: string, value: Exclude<AnalyticsConsentValue, "unset">, maxAgeSeconds: number) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredConsentPayload = { v: value, exp: Date.now() + maxAgeSeconds * 1000 };
    window.localStorage.setItem(name, JSON.stringify(payload));
  } catch {
    // ignore (private mode / disabled storage)
  }
}

function setSession(name: string, value: Exclude<AnalyticsConsentValue, "unset">, maxAgeSeconds: number) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredConsentPayload = { v: value, exp: Date.now() + maxAgeSeconds * 1000 };
    window.sessionStorage.setItem(name, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getPersistedAnalyticsConsent(): AnalyticsConsentValue {
  const cookie = getCookieValue(ANALYTICS_CONSENT_COOKIE_NAME);
  if (cookie === "granted" || cookie === "denied") return cookie;

  const storage = getStorageValue(CONSENT_STORAGE_KEY);
  if (storage) return storage;

  const session = getSessionValue(CONSENT_SESSION_KEY);
  if (session) return session;

  return "unset";
}

/**
 * Reads the consent value from the cookie only.
 * This is the source-of-truth for SSR gating (layouts/middleware).
 */
export function getAnalyticsConsentCookie(): AnalyticsConsentValue {
  const cookie = getCookieValue(ANALYTICS_CONSENT_COOKIE_NAME);
  if (cookie === "granted" || cookie === "denied") return cookie;
  return "unset";
}

export function getAnalyticsConsent(): AnalyticsConsentValue {
  const persisted = getPersistedAnalyticsConsent();
  if (persisted !== "unset") {
    memoryConsent = persisted;
    return persisted;
  }

  // If cookies/storage are blocked, still respect the user's choice for this session (SPA only),
  // but never beyond the configured consent TTL.
  if (memoryConsent !== "unset" && Date.now() < memoryExpiresAt) return memoryConsent;

  memoryConsent = "unset";
  memoryExpiresAt = 0;
  return "unset";
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsentValue, "unset">, maxAgeSeconds = CONSENT_TTL_SECONDS) {
  memoryConsent = value;
  memoryExpiresAt = Date.now() + maxAgeSeconds * 1000;
  setCookie(ANALYTICS_CONSENT_COOKIE_NAME, value, maxAgeSeconds);
  setStorage(CONSENT_STORAGE_KEY, value, maxAgeSeconds);
  // Keep a tab-scoped fallback (survives refresh) for environments where cookies/localStorage are blocked.
  setSession(CONSENT_SESSION_KEY, value, maxAgeSeconds);
  // Server-side persistence fallback: if `document.cookie` writes are blocked/quirky in the browser,
  // a same-origin route handler setting `Set-Cookie` often still works.
  if (typeof window !== "undefined") {
    try {
      fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ analytics: value }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  if (value === "denied") {
    clearGoogleAnalyticsCookies();
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
}

export function subscribeAnalyticsConsent(onChange: (value: AnalyticsConsentValue) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange(getAnalyticsConsent());
  const onStorage = (event: StorageEvent) => {
    if (!event.key) return;
    if (event.key !== CONSENT_STORAGE_KEY) return;
    handler();
  };
  window.addEventListener(CONSENT_EVENT, handler);
  window.addEventListener("storage", onStorage);
  // Ensure initial sync on mount (important for SSR/hydration and route-group mounts).
  handler();
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

export function clearGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const candidates = ["_ga", "_gid", "_gat", "_gcl_au"];
  const secureAttr = isSecureCookieEnv() ? "; Secure" : "";
  for (const name of candidates) {
    // Clear at current path + root.
    document.cookie = `${name}=; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureAttr}`;
  }
}
