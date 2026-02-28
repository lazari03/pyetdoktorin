import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";

export default async function BlogPage() {
  const t = await getServerTranslations();

  const posts = [
    {
      title: t("blogCard1Title"),
      excerpt: t("blogCard1Excerpt"),
      tag: t("blogCard1Tag"),
      date: t("blogCard1Date"),
    },
    {
      title: t("blogCard2Title"),
      excerpt: t("blogCard2Excerpt"),
      tag: t("blogCard2Tag"),
      date: t("blogCard2Date"),
    },
    {
      title: t("blogCard3Title"),
      excerpt: t("blogCard3Excerpt"),
      tag: t("blogCard3Tag"),
      date: t("blogCard3Date"),
    },
  ];

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
            {posts.map((post) => (
              <article key={post.title} className="website-card flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                  <span>{post.tag}</span>
                  <span className="text-slate-400 tracking-normal normal-case font-medium">{post.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                <p className="text-sm text-slate-600">{post.excerpt}</p>
              </article>
            ))}
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
