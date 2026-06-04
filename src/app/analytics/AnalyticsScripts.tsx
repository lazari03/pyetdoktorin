"use client";

import Script from "next/script";
import { useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "";

export default function AnalyticsScripts() {
  const [nonce] = useState(() => {
    if (typeof document === "undefined") return "";
    return document.querySelector('meta[name="csp-nonce"]')?.getAttribute("content") || "";
  });

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        nonce={nonce || undefined}
      />
      <Script id="gtag-init" strategy="afterInteractive" nonce={nonce || undefined}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
