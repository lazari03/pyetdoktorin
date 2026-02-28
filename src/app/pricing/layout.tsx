import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Çmimet | Pyet Doktorin",
  description: "Çmime të qarta për konsultë mjeku online, klinika dhe ekipe shëndetësore.",
  path: "/pricing",
  keywords: SEO_KEYWORDS_AL,
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
