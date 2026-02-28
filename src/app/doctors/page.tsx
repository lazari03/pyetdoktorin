import "../styles.css";
import WebsiteShell from '../../presentation/components/website/WebsiteShell';
import WebsiteHero from '../../presentation/components/website/WebsiteHero';
import WebsiteSection from '../../presentation/components/website/WebsiteSection';
import WebsiteFeatureGrid from '../../presentation/components/website/WebsiteFeatureGrid';
import WebsiteSplitSection from '../../presentation/components/website/WebsiteSplitSection';
import WebsiteCta from '../../presentation/components/website/WebsiteCta';
import { getServerTranslations } from "@/i18n/serverTranslations";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export async function generateMetadata() {
  const t = await getServerTranslations();
  return buildMetadata({
    title: t("doctorsMetaTitle"),
    description: t("doctorsMetaDescription"),
    path: "/doctors",
    keywords: SEO_KEYWORDS_AL,
  });
}

export default async function DoctorsPage() {
  const t = await getServerTranslations();
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--doctors"
        eyebrow={t("doctorsHeroEyebrow")}
        title={t("doctorsHeroTitle")}
        highlight={t("doctorsHeroHighlight")}
        subtitle={t("doctorsHeroSubtitle")}
        primaryCta={{ label: t("doctorsHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("doctorsHeroSecondaryCta"), href: "/individuals" }}
        imageSrc="/api/images?key=dashboard"
        imageAlt={t("doctorsHeroImageAlt")}
        chip={t("doctorsHeroChip")}
        metaText={t("doctorsHeroMeta")}
        floatingText={t("doctorsHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("doctorsWhyEyebrow")}</div>
          <h2 className="website-section-title">{t("doctorsWhyTitle")}</h2>
          <WebsiteFeatureGrid
            features={[
              {
                title: t("doctorsFeature1Title"),
                description: t("doctorsFeature1Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 4v4m10-4v4M4 10h16v8H4z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("doctorsFeature2Title"),
                description: t("doctorsFeature2Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M5 4h10l4 4v12H5z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("doctorsFeature3Title"),
                description: t("doctorsFeature3Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteSplitSection
            eyebrow={t("doctorsSplitEyebrow")}
            title={t("doctorsSplitTitle")}
            body={t("doctorsSplitBody")}
            bullets={[
              t("doctorsSplitBullet1"),
              t("doctorsSplitBullet2"),
              t("doctorsSplitBullet3"),
            ]}
            imageSrc="/api/images?key=hero1"
            imageAlt={t("doctorsSplitImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("doctorsCtaTitle")}
            subtitle={t("doctorsCtaSubtitle")}
            primary={{ label: t("doctorsCtaPrimary"), href: "/register" }}
            secondary={{ label: t("doctorsCtaSecondary"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
