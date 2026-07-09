import Link from "next/link";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMedicalOrganizationSchema, buildMedicalWebPageSchema, buildMetadata, buildWebSiteSchema, SEO_KEYWORDS_AL } from "@/app/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Konsultë mjeku online | Pyet Doktorin",
  description: "Rezervo mjekë shqiptarë online, merr recetë elektronike dhe paguaj vetëm pasi mjeku pranon.",
  path: "/",
  keywords: SEO_KEYWORDS_AL,
});

export default async function Home() {
  const t = await getServerTranslations();
  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildWebSiteSchema(),
          buildMedicalWebPageSchema({
            title: t("homeMetaTitle"),
            description: t("homeMetaDescription"),
            path: "/",
          }),
        ]}
      />
      <WebsiteHero
        className="website-hero--home"
        eyebrow={t("homeHeroEyebrow")}
        title={t("homeHeroTitle")}
        highlight={t("homeHeroHighlight")}
        subtitle={t("homeHeroSubtitle")}
        primaryCta={{ label: t("homeHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("homeHeroSecondaryCta"), href: "/si-funksionon" }}
        imageSrc="/website/home-hero-premium.svg"
        imageAlt={t("homeHeroImageAlt")}
        chip={t("homeHeroChip")}
        metaText={t("homeHeroMeta")}
        floatingText={t("homeHeroFloating")}
        priority
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("homeWhyEyebrow")}</div>
          <h2 className="website-section-title">{t("homeWhyTitle")}</h2>
          <p className="website-section-body">{t("homeWhySubtitle")}</p>
          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("homeFeature1Title"),
                  description: t("homeFeature1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: t("homeFeature2Title"),
                  description: t("homeFeature2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("homeFeature3Title"),
                  description: t("homeFeature3Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M12 10v6M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteSplitSection
            eyebrow={t("homeSplitEyebrow")}
            title={t("homeSplitTitle")}
            body={t("homeSplitBody")}
            bullets={[
              t("homeSplitBullet1"),
              t("homeSplitBullet2"),
              t("homeSplitBullet3"),
            ]}
            imageSrc="/website/home-care-premium.svg"
            imageAlt={t("homeSplitImageAlt")}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("homeLinksEyebrow")}</div>
          <h2 className="website-section-title">{t("homeLinksTitle")}</h2>
          <p className="website-section-body">{t("homeLinksSubtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/si-funksionon", label: t("homeLinkHowItWorks"), desc: t("homeLinkHowItWorksDesc") },
              { href: "/doctors", label: t("homeLinkDoctors"), desc: t("homeLinkDoctorsDesc") },
              { href: "/services", label: t("homeLinkSpecialties"), desc: t("homeLinkSpecialtiesDesc") },
              { href: "/pricing", label: t("homeLinkPricing"), desc: t("homeLinkPricingDesc") },
              { href: "/blog", label: t("homeLinkBlog"), desc: t("homeLinkBlogDesc") },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="website-card group">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900 group-hover:text-purple-700">
                  <span>{link.label}</span>
                  <span aria-hidden className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-purple-700">→</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteStatsStrip
            stats={[
              { value: "€13", label: t("homeStat1Label") },
              { value: "24/7", label: t("homeStat2Label") },
              { value: "3", label: t("homeStat3Label") },
              { value: "100%", label: t("homeStat4Label") },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteCta
            title={t("homeCtaTitle")}
            subtitle={t("homeCtaSubtitle")}
            primary={{ label: t("homeCtaPrimary"), href: "/register" }}
            secondary={{ label: t("homeCtaSecondary"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
