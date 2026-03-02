"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { clearGoogleAnalyticsCookies, getAnalyticsConsent, subscribeAnalyticsConsent } from "@/presentation/utils/analyticsConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "";

export default function AnalyticsScripts() {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  useEffect(() => subscribeAnalyticsConsent(setConsent), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== "function") return;

    if (consent === "granted") {
      try {
        gtag("consent", "update", { analytics_storage: "granted" });
      } catch {}
    }

    if (consent === "denied") {
      try {
        gtag("consent", "update", { analytics_storage: "denied" });
      } catch {}
      clearGoogleAnalyticsCookies();
    }
  }, [consent]);

  if (!GA_ID) return null;
  if (consent !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', { analytics_storage: 'granted' });
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

