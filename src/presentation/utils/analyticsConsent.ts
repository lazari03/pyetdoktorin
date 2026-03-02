import { ANALYTICS_CONSENT_COOKIE_NAME, COOKIE_SAMESITE, isSecureCookieEnv } from "@/config/cookies";

export type AnalyticsConsentValue = "granted" | "denied" | "unset";

const CONSENT_EVENT = "analytics_consent_changed";
const CONSENT_STORAGE_KEY = ANALYTICS_CONSENT_COOKIE_NAME;
let memoryConsent: AnalyticsConsentValue = "unset";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function getStorageValue(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(name);
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secureAttr = isSecureCookieEnv() ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${maxAgeSeconds}${secureAttr}`;
}

function setStorage(name: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(name, value);
  } catch {
    // ignore (private mode / disabled storage)
  }
}

export function getAnalyticsConsent(): AnalyticsConsentValue {
  const raw =
    getCookieValue(ANALYTICS_CONSENT_COOKIE_NAME) ??
    getStorageValue(CONSENT_STORAGE_KEY);
  if (raw === "granted" || raw === "denied") {
    memoryConsent = raw;
    return raw;
  }
  // If cookies/localStorage are blocked, still respect the user's choice for this session.
  return memoryConsent;
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsentValue, "unset">, maxAgeSeconds = 31536000) {
  memoryConsent = value;
  setCookie(ANALYTICS_CONSENT_COOKIE_NAME, value, maxAgeSeconds);
  setStorage(CONSENT_STORAGE_KEY, value);
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
    document.cookie = `${name}=; path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=0${secureAttr}`;
  }
}
