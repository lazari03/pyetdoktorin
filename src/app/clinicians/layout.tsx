import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Clinics & Care Teams | Pyet Doktorin",
  description: "Clinic management app with scheduling, virtual visits, payments, and analytics in one place.",
  path: "/clinicians",
});

export default function CliniciansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
