import type { Metadata } from "next";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Si funksionon Pyet Doktorin",
  description: "Rezervo konsultë mjeku online në tre hapa: zgjidh mjekun, konfirmo takimin dhe merr recetën elektronike.",
  path: "/how-it-works",
  keywords: SEO_KEYWORDS_AL,
});

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
