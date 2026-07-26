import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import { buildMetadata, SEO_KEYWORDS_AL } from "@/app/seo";

export async function generateMetadata() {
  const t = await getServerTranslations();
  return buildMetadata({
    title: t("aboutMetaTitle"),
    description: t("aboutMetaDescription"),
    path: "/about",
    keywords: SEO_KEYWORDS_AL,
  });
}

export default async function AboutPage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("aboutHeroEyebrow")}
        title={t("aboutUs")}
        subtitle={t("aboutUsDescription")}
        primaryCta={{ label: t("registerNow"), href: "/register" }}
        secondaryCta={{ label: t("contact"), href: "/contact" }}
        imageSrc="/website/hero1.svg"
        imageAlt={t("aboutTeamImageAlt")}
      />

      <WebsiteSection>
        <div className="website-container">
          <WebsiteSplitSection
            eyebrow={t("aboutMissionEyebrow")}
            title={t("aboutConnectHealthcare")}
            body={t("aboutPlatformDescription")}
            bullets={[t("mission"), t("vision"), t("ourValue")]}
            imageSrc="/website/home-care-premium.svg"
            imageAlt={t("aboutTeamImageAlt")}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteSplitSection
            eyebrow={t("aboutApproachEyebrow")}
            title={t("aboutVitalLook")}
            body={t("aboutTermsDescription")}
            bullets={[t("bookOnlineConsultations"), t("weSetTheBar"), t("seamlessExperience")]}
            imageSrc="/website/dashboard.svg"
            imageAlt={t("aboutTeamImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteStatsStrip
            stats={[
              { value: "4+", label: t("yearsExperience") },
              { value: "99%", label: t("satisfactionRate") },
              { value: "500+", label: t("positiveReviews") },
              { value: "600+", label: t("trustedPartners") },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteFeatureGrid
            features={[
              {
                title: t("bookOnlineConsultations"),
                description: t("bookOnlineConsultationsDesc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: t("weSetTheBar"),
                description: t("weSetTheBarDesc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20V4m0 0l-7 7m7-7l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: t("seamlessExperience"),
                description: t("seamlessExperienceDesc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9V7a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("aboutCtaTitle")}
            subtitle={t("aboutCtaSubtitle")}
            primary={{ label: t("registerNow"), href: "/register" }}
            secondary={{ label: t("contact"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
