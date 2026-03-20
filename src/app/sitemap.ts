import type { MetadataRoute } from "next";
import { ROUTES } from "@/config/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://pyetdoktorin.al";

type SitemapEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified?: Date;
};

const coreRoutes: SitemapEntry[] = [
  { path: ROUTES.ROOT,            changeFrequency: "daily",   priority: 1.0  },
  { path: ROUTES.DOCTORS,         changeFrequency: "daily",   priority: 0.95 },
  { path: ROUTES.INDIVIDUALS,     changeFrequency: "weekly",  priority: 0.9  },
  { path: ROUTES.PRICING,         changeFrequency: "weekly",  priority: 0.9  },
  { path: ROUTES.ONLINE_CONSULT,  changeFrequency: "weekly",  priority: 0.85 },
  { path: ROUTES.E_PRESCRIPTION,  changeFrequency: "weekly",  priority: 0.85 },
  { path: ROUTES.PSYCHOLOGIST,    changeFrequency: "weekly",  priority: 0.85 },
  { path: ROUTES.HOW_IT_WORKS_AL, changeFrequency: "monthly", priority: 0.8  },
  { path: ROUTES.SERVICES,        changeFrequency: "monthly", priority: 0.8  },
  { path: ROUTES.CLINICIANS,      changeFrequency: "weekly",  priority: 0.8  },
  { path: ROUTES.BLOG,            changeFrequency: "daily",   priority: 0.75 },
  { path: ROUTES.ABOUT,           changeFrequency: "monthly", priority: 0.6  },
  { path: ROUTES.CONTACT,         changeFrequency: "monthly", priority: 0.6  },
  { path: ROUTES.HELP_CENTER,     changeFrequency: "monthly", priority: 0.5  },
  { path: ROUTES.JOBS,            changeFrequency: "weekly",  priority: 0.5  },
  { path: ROUTES.TERMS,           changeFrequency: "yearly",  priority: 0.3  },
  { path: ROUTES.PRIVACY,         changeFrequency: "yearly",  priority: 0.3  },
];

const specialtyRoutes: SitemapEntry[] = [
  "/specialitete/kardiologji",
  "/specialitete/pediatri",
  "/specialitete/dermatologji",
  "/specialitete/neurologji",
  "/specialitete/psikologji",
  "/specialitete/gjinekologji",
  "/specialitete/ortopedi",
  "/specialitete/endokrinologji",
].map((path) => ({ path, changeFrequency: "weekly" as const, priority: 0.8 }));

const cityRoutes: SitemapEntry[] = [
  "/qytetet/tirane",
  "/qytetet/durres",
  "/qytetet/vlore",
  "/qytetet/shkoder",
  "/qytetet/elbasan",
  "/qytetet/fier",
  "/qytetet/korce",
].map((path) => ({ path, changeFrequency: "weekly" as const, priority: 0.75 }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Static routes
  const staticEntries = [...coreRoutes, ...specialtyRoutes, ...cityRoutes].map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );

  // Dynamic blog posts — fetched from Firestore
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { getAllPublishedPostsMeta } = await import(
      "@/infrastructure/services/blogServiceServer"
    );
    const posts = await getAllPublishedPostsMeta();
    blogEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // If Firestore is unavailable during build, skip blog entries gracefully
  }

  return [...staticEntries, ...blogEntries];
}
