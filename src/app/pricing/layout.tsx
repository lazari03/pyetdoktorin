import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing & Plans | Pyet Doktorin",
  description: "Transparent pricing for clinics, doctors, and enterprise telemedicine teams.",
  path: "/pricing",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
