import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Jobs | Pyet Doktorin",
  description: "Join the Pyet Doktorin team and help shape the future of telemedicine.",
  path: "/jobs",
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
