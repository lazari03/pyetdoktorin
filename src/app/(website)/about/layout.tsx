import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Pyet Doktorin",
  description: "Discover Pyet Doktorin, the digital platform connecting clinics, doctors, and patients for secure video consultations.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
