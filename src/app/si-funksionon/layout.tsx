import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Si funksionon | Pyet Doktorin",
  description: "Mëso si të rezervosh konsultë mjeku online, të konfirmosh takimin dhe të marrësh recetën elektronike.",
  path: "/si-funksionon",
  keywords: SEO_KEYWORDS_AL,
});

export default function SiFunksiononLayout({ children }: { children: React.ReactNode }) {
  return children;
}
