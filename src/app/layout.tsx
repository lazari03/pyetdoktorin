import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { DIProvider } from '@/context/DIContext';
import Script from "next/script";
import Analytics from "./analytics/Analytics";
import { Suspense } from "react";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Alo Doktor",
  description: "Telemedicine Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get('language')?.value || 'en';
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang={lang} data-theme="light">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}');
          `}
        </Script>
      </head>
      <body className="bg-base-100 min-h-screen">
        <DIProvider>
          <ClientProviders>
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            {children}
          </ClientProviders>
        </DIProvider>
      </body>
    </html>
  );
}
