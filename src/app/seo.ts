import type { Metadata } from "next";
import { APPOINTMENT_PRICE_CURRENCY, APPOINTMENT_PRICE_EUR } from "@/config/paywallConfig";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";
const DEFAULT_IMAGE = "/og/pyet-doktorin.svg";
const DEFAULT_LOCALE = "sq_AL";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  locale?: string;
};

export function buildMetadata({ title, description, path, keywords, locale = DEFAULT_LOCALE }: BuildMetadataOptions): Metadata {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Pyet Doktorin",
      locale,
      alternateLocale: locale === "sq_AL" ? ["en_US"] : ["sq_AL"],
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: "Pyet Doktorin",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_IMAGE],
    },
    other: {
      "content-language": locale === "sq_AL" ? "sq-AL" : "en-US",
    },
  };
}

export function getSiteUrl() {
  return SITE_URL;
}

export const SEO_KEYWORDS_AL = [
  "konsultë mjeku online",
  "mjek online Shqipëri",
  "recetë elektronike",
  "doktor online tani",
  "telemedicinë Shqipëri",
  "psikolog online",
];

const currencySymbolMap: Record<string, string> = {
  EUR: "€",
  USD: "$",
};

const currencySymbol = currencySymbolMap[APPOINTMENT_PRICE_CURRENCY];
const priceRange = currencySymbol
  ? `${currencySymbol}${APPOINTMENT_PRICE_EUR}`
  : `${APPOINTMENT_PRICE_CURRENCY} ${APPOINTMENT_PRICE_EUR}`;

type JsonLd = Record<string, unknown>;

export function buildMedicalOrganizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "Pyet Doktorin",
    url: SITE_URL,
    areaServed: "AL",
    priceRange,
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
        contactType: "customer support",
        email: "info@pyetdoktorin.al",
        areaServed: "AL",
      },
    ],
  };
}

export function buildMedicalWebPageSchema({
  title,
  description,
  path,
  keywords = SEO_KEYWORDS_AL,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: "sq-AL",
    keywords: keywords.join(", "),
  };
}

export function buildPhysicianSchema({
  name,
  specialty,
  path,
}: {
  name: string;
  specialty: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    medicalSpecialty: specialty,
    url: `${SITE_URL}${path}`,
    worksFor: {
      "@type": "MedicalOrganization",
      name: "Pyet Doktorin",
      url: SITE_URL,
    },
  };
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
