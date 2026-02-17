import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Pyet Doktorin",
  description: "Talk to sales or support to launch Pyet Doktorin for your clinic or practice.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
