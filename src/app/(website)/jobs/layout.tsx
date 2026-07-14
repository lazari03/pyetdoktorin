import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";

export const metadata: Metadata = buildMetadata({
  title: "Jobs | Pyet Doktorin",
  description: "Help build the platform connecting patients with licensed doctors, at Pyet Doktorin.",
  path: "/jobs",
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
