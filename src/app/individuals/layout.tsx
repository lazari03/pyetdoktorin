import type { Metadata } from "next";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Patients | Pyet Doktorin",
  description: "Book secure online doctor visits, chat, and video from your phone.",
  path: "/individuals",
});

export default function IndividualsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
