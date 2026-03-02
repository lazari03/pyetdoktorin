import type { MetadataRoute } from "next";
import { ROUTES } from "@/config/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          ROUTES.ADMIN,
          ROUTES.DASHBOARD,
          "/api",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
