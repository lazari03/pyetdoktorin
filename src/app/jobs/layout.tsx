import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Jobs | Pyet Doktorin",
  description: "Build the future of telemedicine with Pyet Doktorin.",
  path: "/jobs",
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
