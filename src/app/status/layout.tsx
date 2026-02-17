import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Status | Pyet Doktorin",
  description: "Live uptime, incidents, and platform status for Pyet Doktorin.",
  path: "/status",
});

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
