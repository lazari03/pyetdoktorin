import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Recetë elektronike | Pyet Doktorin",
  description: "Merr recetën elektronike të firmosur nga mjeku dhe ndiq statusin në farmacitë partnere.",
  path: "/recete-elektronike",
  keywords: SEO_KEYWORDS_AL,
});

export default function ReceteElektronikeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
