import type { Metadata } from "next";

// Status page should not be indexed — it has no SEO value
export const metadata: Metadata = {
  title: "Status | Pyet Doktorin",
  description: "Live uptime and platform status for Pyet Doktorin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
