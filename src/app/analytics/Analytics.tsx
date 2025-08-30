"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";


// Declare gtag on the window object for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_ID, {
        page_path: pathname + (searchParams ? `?${searchParams}` : ""),
      });
    }
  }, [pathname, searchParams]);

  return null;
}
