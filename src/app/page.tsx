'use client';

import "./styles.css";
import { useTranslation } from "react-i18next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";

export default function Home() {
  const { t } = useTranslation();
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--home"
        eyebrow={t("homeHeroEyebrow")}
        title={t("homeHeroTitle")}
        highlight={t("homeHeroHighlight")}
        subtitle={t("homeHeroSubtitle")}
        primaryCta={{ label: t("homeHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("homeHeroSecondaryCta"), href: "/contact" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={t("homeHeroImageAlt")}
        chip={t("homeHeroChip")}
        metaText={t("homeHeroMeta")}
        floatingText={t("homeHeroFloating")}
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
                      <path d="M5 7h9a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H5l-3 3V7z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("homeFeature2Title"),
                  description: t("homeFeature2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("homeFeature3Title"),
                  description: t("homeFeature3Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M3 8h18v8H3z" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 12h4" stroke="currentColor" strokeWidth="2" />
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
            imageSrc="/api/images?key=child1"
            imageAlt={t("homeSplitImageAlt")}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteStatsStrip
            stats={[
              { value: "98%", label: t("homeStat1Label") },
              { value: "24/7", label: t("homeStat2Label") },
              { value: "2x", label: t("homeStat3Label") },
              { value: "1M+", label: t("homeStat4Label") },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
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
