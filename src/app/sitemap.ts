import type { MetadataRoute } from "next";
import { ROUTES } from "@/config/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";

const routeList = [
  ROUTES.ROOT,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.CLINICIANS,
  ROUTES.DOCTORS,
  ROUTES.INDIVIDUALS,
  ROUTES.PRICING,
  ROUTES.HELP_CENTER,
  ROUTES.JOBS,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.BLOG,
  ROUTES.STATUS,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routeList.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === ROUTES.ROOT ? 1 : 0.7,
  }));
}
