import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Psikolog online | Pyet Doktorin",
  description: "Konsulta psikologjike online, diskrete dhe e sigurt me profesionistë shqiptarë.",
  path: "/psikolog-online",
  keywords: SEO_KEYWORDS_AL,
});

export default function PsikologOnlineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
