import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing | Pyet Doktorin",
  description: "Explore Pyet Doktorin pricing and choose the right plan for your needs.",
  path: "/pricing",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
