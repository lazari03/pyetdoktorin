import "../styles.css";
import WebsiteShell from '../../presentation/components/website/WebsiteShell';
import WebsiteHero from '../../presentation/components/website/WebsiteHero';
import WebsiteSection from '../../presentation/components/website/WebsiteSection';
import WebsiteFeatureGrid from '../../presentation/components/website/WebsiteFeatureGrid';
import WebsiteSplitSection from '../../presentation/components/website/WebsiteSplitSection';
import WebsiteCta from '../../presentation/components/website/WebsiteCta';
import { getServerTranslations } from "@/i18n/serverTranslations";

export default async function ClinicsPage() {
  const t = await getServerTranslations();
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--clinics"
        eyebrow={t("clinicsHeroEyebrow")}
        title={t("clinicsHeroTitle")}
        highlight={t("clinicsHeroHighlight")}
        subtitle={t("clinicsHeroSubtitle")}
        primaryCta={{ label: t("clinicsHeroPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("clinicsHeroSecondaryCta"), href: "/individuals" }}
        imageSrc="/api/images?key=avatar1"
        imageAlt={t("clinicsHeroImageAlt")}
        chip={t("clinicsHeroChip")}
        metaText={t("clinicsHeroMeta")}
        floatingText={t("clinicsHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("clinicsWhyEyebrow")}</div>
          <h2 className="website-section-title">{t("clinicsWhyTitle")}</h2>
          <WebsiteFeatureGrid
            features={[
              {
                title: t("clinicsFeature1Title"),
                description: t("clinicsFeature1Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10h16M6 6h12M8 14h8M5 18h14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("clinicsFeature2Title"),
                description: t("clinicsFeature2Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 18h16M6 14l3-3 3 2 4-5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("clinicsFeature3Title"),
                description: t("clinicsFeature3Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" />
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
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
            eyebrow={t("clinicsSplitEyebrow")}
            title={t("clinicsSplitTitle")}
            body={t("clinicsSplitBody")}
            bullets={[
              t("clinicsSplitBullet1"),
              t("clinicsSplitBullet2"),
              t("clinicsSplitBullet3"),
            ]}
            imageSrc="/api/images?key=dashboard"
            imageAlt={t("clinicsSplitImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("clinicsCtaTitle")}
            subtitle={t("clinicsCtaSubtitle")}
            primary={{ label: t("clinicsCtaPrimary"), href: "/register" }}
            secondary={{ label: t("clinicsCtaSecondary"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
