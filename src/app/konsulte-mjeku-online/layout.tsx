import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Konsultë mjeku online | Pyet Doktorin",
  description: "Rezervo konsultë mjeku online me mjekë shqiptarë të verifikuar dhe paguaj vetëm pasi mjeku pranon.",
  path: "/konsulte-mjeku-online",
  keywords: SEO_KEYWORDS_AL,
});

export default function KonsulteMjekuOnlineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
