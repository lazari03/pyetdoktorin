import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";

const routes = [
  "",
  "/about",
  "/contact",
  "/clinicians",
  "/doctors",
  "/individuals",
  "/pricing",
  "/help-center",
  "/jobs",
  "/terms-of-service",
  "/privacy-policy",
  "/blog",
  "/status",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
