import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Doctors | Pyet Doktorin",
  description: "Doctor app for virtual visits, smart scheduling, secure notes, and earnings.",
  path: "/doctors",
});

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
