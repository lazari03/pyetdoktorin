'use client';

import "../styles.css";
import { useTranslation } from "react-i18next";
import WebsiteShell from '../../presentation/components/website/WebsiteShell';
import WebsiteHero from '../../presentation/components/website/WebsiteHero';
import WebsiteSection from '../../presentation/components/website/WebsiteSection';
import WebsiteFeatureGrid from '../../presentation/components/website/WebsiteFeatureGrid';
import WebsiteSplitSection from '../../presentation/components/website/WebsiteSplitSection';
import WebsiteCta from '../../presentation/components/website/WebsiteCta';

export default function IndividualsPage() {
  const { t } = useTranslation();
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("individualsHeroEyebrow")}
        title={t("individualsHeroTitle")}
        highlight={t("individualsHeroHighlight")}
        subtitle={t("individualsHeroSubtitle")}
        primaryCta={{ label: t("individualsHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("individualsHeroSecondaryCta"), href: "/doctors" }}
        imageSrc="/api/images?key=child1"
        imageAlt={t("individualsHeroImageAlt")}
        chip={t("individualsHeroChip")}
        metaText={t("individualsHeroMeta")}
        floatingText={t("individualsHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("individualsWhyEyebrow")}</div>
          <h2 className="website-section-title">{t("individualsWhyTitle")}</h2>
          <WebsiteFeatureGrid
            features={[
              {
                title: t("individualsFeature1Title"),
                description: t("individualsFeature1Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M6 8h12M8 4v4m8-4v4" stroke="currentColor" strokeWidth="2" />
                    <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("individualsFeature2Title"),
                description: t("individualsFeature2Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 12h4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                title: t("individualsFeature3Title"),
                description: t("individualsFeature3Desc"),
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" />
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
            eyebrow={t("individualsSplitEyebrow")}
            title={t("individualsSplitTitle")}
            body={t("individualsSplitBody")}
            bullets={[
              t("individualsSplitBullet1"),
              t("individualsSplitBullet2"),
              t("individualsSplitBullet3"),
            ]}
            imageSrc="/api/images?key=avatar1"
            imageAlt={t("individualsSplitImageAlt")}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("individualsCtaTitle")}
            subtitle={t("individualsCtaSubtitle")}
            primary={{ label: t("individualsCtaPrimary"), href: "/register" }}
            secondary={{ label: t("individualsCtaSecondary"), href: "/doctors" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
