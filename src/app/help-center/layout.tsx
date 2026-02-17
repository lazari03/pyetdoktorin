import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Help Center | Pyet Doktorin",
  description: "Guides, onboarding, and support for the Pyet Doktorin telemedicine platform.",
  path: "/help-center",
});

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
