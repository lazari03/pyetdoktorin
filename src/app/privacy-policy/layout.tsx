import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Pyet Doktorin",
  description: "How Pyet Doktorin protects patient data and privacy.",
  path: "/privacy-policy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
