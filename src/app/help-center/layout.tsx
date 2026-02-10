import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Help Center | Pyet Doktorin",
  description: "Find answers, guides, and support for using Pyet Doktorin.",
  path: "/help-center",
});

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
