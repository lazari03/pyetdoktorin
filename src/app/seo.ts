import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";
const DEFAULT_IMAGE = "/og/pyet-doktorin.svg";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path?: string;
};

export function buildMetadata({ title, description, path }: BuildMetadataOptions): Metadata {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  return {
    title,
    description,
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
      locale: "en_US",
      alternateLocale: ["sq_AL"],
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
  };
}

export function getSiteUrl() {
  return SITE_URL;
}
