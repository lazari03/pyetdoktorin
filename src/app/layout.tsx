import type { Metadata } from "next";
import "./globals.css";
import { Mulish } from "next/font/google";
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
const DEFAULT_DESCRIPTION = "Platforma shqiptare për konsultë mjeku online, recetë elektronike dhe kujdes shëndetësor të sigurt.";
const DEFAULT_KEYWORDS = [
  "konsultë mjeku online",
  "mjek online Shqipëri",
  "recetë elektronike",
  "doktor online tani",
  "telemedicinë Shqipëri",
  "psikolog online",
];

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Pyet Doktorin",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: DEFAULT_TITLE,
  keywords: DEFAULT_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: DEFAULT_TITLE,
    locale: "sq_AL",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/og/pyet-doktorin.svg",
        width: 1200,
        height: 630,
        alt: "Pyet Doktorin",
      },
    ],
  },
  other: {
    "content-language": "sq-AL",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og/pyet-doktorin.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: DEFAULT_TITLE,
    url: SITE_URL,
    email: "atelemedicine30@gmail.com",
    areaServed: "AL",
    medicalSpecialty: [
      "PrimaryCare",
      "Dermatology",
      "Pediatrics",
      "Cardiology",
      "Endocrinology",
      "Gynecology",
      "Psychiatry",
    ],
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
    "@type": "SoftwareApplication",
    name: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    operatingSystem: "Web",
    applicationCategory: "HealthApplication",
    offers: {
      "@type": "Offer",
      price: "13",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
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

const safeStructuredData = structuredData.map((item) => ({
  ...item,
  "@context": item["@context"] || "https://schema.org",
}));

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get('language')?.value || 'al';
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
        {safeStructuredData.map((item, index) => (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
        <HeadNonce />
      </head>
      <body className={`${mulish.className} bg-base-100 min-h-screen`}>
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
