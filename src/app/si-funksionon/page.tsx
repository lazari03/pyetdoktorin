import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMedicalOrganizationSchema, buildMedicalWebPageSchema, buildFaqSchema } from "../seo";

export default async function SiFunksiononPage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildMedicalWebPageSchema({
            title: t("howMetaTitle"),
            description: t("howMetaDescription"),
            path: "/si-funksionon",
          }),
          buildFaqSchema([
            {
              question: t("howFaq1Q"),
              answer: t("howFaq1A"),
            },
            {
              question: t("howFaq2Q"),
              answer: t("howFaq2A"),
            },
            {
              question: t("howFaq3Q"),
              answer: t("howFaq3A"),
            },
          ]),
        ]}
      />
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("howHeroEyebrow")}
        title={t("howHeroTitle")}
        highlight={t("howHeroHighlight")}
        subtitle={t("howHeroSubtitle")}
        primaryCta={{ label: t("howHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("howHeroSecondaryCta"), href: "/contact" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={t("howHeroImageAlt")}
        chip={t("howHeroChip")}
        metaText={t("howHeroMeta")}
        floatingText={t("howHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("howStepsEyebrow")}</div>
          <h2 className="website-section-title">{t("howStepsTitle")}</h2>
          <p className="website-section-body">{t("howStepsSubtitle")}</p>
          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("howStep1Title"),
                  description: t("howStep1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 10h8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("howStep2Title"),
                  description: t("howStep2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("howStep3Title"),
                  description: t("howStep3Desc"),
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
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteSplitSection
            eyebrow={t("howTrustEyebrow")}
            title={t("howTrustTitle")}
            body={t("howTrustBody")}
            bullets={[
              t("howTrustBullet1"),
              t("howTrustBullet2"),
              t("howTrustBullet3"),
            ]}
            imageSrc="/api/images?key=dashboard"
            imageAlt={t("howTrustImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteStatsStrip
            stats={[
              { value: "24/7", label: t("howStat1") },
              { value: "15 min", label: t("howStat2") },
              { value: "100%", label: t("howStat3") },
              { value: "1 klik", label: t("howStat4") },
            ]}
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("howCtaTitle")}
            subtitle={t("howCtaSubtitle")}
            primary={{ label: t("howCtaPrimary"), href: "/register" }}
            secondary={{ label: t("howCtaSecondary"), href: "/pricing" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
