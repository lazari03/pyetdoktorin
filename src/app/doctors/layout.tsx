import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Doctors | Pyet Doktorin",
  description: "Join Pyet Doktorin to consult patients, manage appointments, and grow your practice.",
  path: "/doctors",
});

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
