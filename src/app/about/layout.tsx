import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "About Pyet Doktorin",
  description: "Discover Pyet Doktorin, the telemedicine app connecting clinics, doctors, and patients with secure virtual care.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
