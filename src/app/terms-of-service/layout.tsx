import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service | Pyet Doktorin",
  description: "Terms and conditions for using Pyet Doktorin.",
  path: "/terms-of-service",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
