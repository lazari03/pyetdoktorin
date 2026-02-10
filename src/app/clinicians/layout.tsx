import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Clinicians | Pyet Doktorin",
  description: "Tools for clinics and care teams to manage appointments, patients, and operations.",
  path: "/clinicians",
});

export default function CliniciansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
