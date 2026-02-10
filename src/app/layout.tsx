import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { DIProvider } from '@/context/DIContext';
import Script from "next/script";
import Analytics from "./analytics/Analytics";
import { Suspense } from "react";
import { cookies } from "next/headers";
import HeadNonce from "./HeadNonce";
import { getSiteUrl } from "./seo";

const SITE_URL = getSiteUrl();
const DEFAULT_TITLE = "Pyet Doktorin";
const DEFAULT_DESCRIPTION = "Telemedicine Platform";

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: DEFAULT_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: DEFAULT_TITLE,
    url: SITE_URL,
    email: "atelemedicine30@gmail.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "atelemedicine30@gmail.com",
        contactType: "customer support",
        areaServed: "AL",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: DEFAULT_TITLE,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/doctors?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get('language')?.value || 'en';
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang={lang} data-theme="light">
      <head>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HeadNonce />
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
