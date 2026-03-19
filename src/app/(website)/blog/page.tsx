import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import { buildMetadata, SEO_KEYWORDS_AL } from "@/app/seo";
import { getPublishedBlogPostsServer as getPublishedBlogPosts } from "@/infrastructure/services/blogServiceServer";
import Link from "next/link";

export const revalidate = 60; // revalidate every 60s

export async function generateMetadata() {
  const t = await getServerTranslations();
  return buildMetadata({
    title: t("blogMetaTitle"),
    description: t("blogMetaDescription"),
    path: "/blog",
    keywords: SEO_KEYWORDS_AL,
  });
}

export default async function BlogPage() {
  const t = await getServerTranslations();
const posts = await getPublishedBlogPosts().catch((e) => { console.error('Blog fetch error:', e); return []; });
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--home"
        variant="centered"
        eyebrow={t("blogEyebrow")}
        title={t("blog")}
        subtitle={t("blogSubtitle")}
        primaryCta={{ label: t("blogPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("home"), href: "/" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("blogSectionEyebrow")}</div>
          <h2 className="website-section-title">{t("blogSectionTitle")}</h2>
          <p className="website-section-body">{t("blogSectionSubtitle")}</p>

          <div className="mt-10 website-grid">
            {posts.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-10">
                No articles published yet. Check back soon!
              </p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="website-card flex flex-col gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                    <span>{post.tag}</span>
                    <span className="text-slate-400 tracking-normal normal-case font-medium">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("sq-AL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                  <p className="text-sm text-slate-600 flex-1">{post.excerpt}</p>
                  <span className="text-sm font-semibold text-purple-600">Lexo më shumë →</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("blogCtaTitle")}
            subtitle={t("blogCtaSubtitle")}
            primary={{ label: t("blogCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("register"), href: "/register" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
