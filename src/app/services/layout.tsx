import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Shërbime mjekësore online | Pyet Doktorin",
  description: "Akses te specialistë shqiptarë online: mjekësi familjare, pediatri, dermatologji, kardiologji, endokrinologji dhe më shumë.",
  path: "/services",
  keywords: SEO_KEYWORDS_AL,
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
