import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Individuals | Pyet Doktorin",
  description: "Access trusted telemedicine care and book appointments from anywhere.",
  path: "/individuals",
});

export default function IndividualsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
