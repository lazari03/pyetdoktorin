type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA_ID ||
  "";

export function trackAnalyticsEvent(eventName: string, params?: AnalyticsParams) {
  if (typeof window === "undefined" || !GA_ID) return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", eventName, params ?? {});
  } catch {
    // Analytics should never break functionality.
  }
}
