import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog | Pyet Doktorin",
  description: "Product updates and telemedicine insights from the Pyet Doktorin team.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
