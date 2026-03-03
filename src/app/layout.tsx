import type { Metadata } from "next";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { getSiteUrl } from "./seo";
import { LANGUAGE_COOKIE_NAME } from "@/config/cookies";

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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get(LANGUAGE_COOKIE_NAME)?.value || 'al';
  const nonce = (await headers()).get('x-nonce') || '';
  const requestId = (await headers()).get('x-request-id') || '';
  return (
    <html lang={lang} data-theme="light">
      <head>
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
        {requestId ? <meta name="request-id" content={requestId} /> : null}
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
