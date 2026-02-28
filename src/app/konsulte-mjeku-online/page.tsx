import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMedicalOrganizationSchema, buildMedicalWebPageSchema, buildFaqSchema } from "../seo";

export default async function KonsulteMjekuOnlinePage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildMedicalWebPageSchema({
            title: t("onlineConsultMetaTitle"),
            description: t("onlineConsultMetaDescription"),
            path: "/konsulte-mjeku-online",
          }),
          buildFaqSchema([
            { question: t("onlineConsultFaq1Q"), answer: t("onlineConsultFaq1A") },
            { question: t("onlineConsultFaq2Q"), answer: t("onlineConsultFaq2A") },
            { question: t("onlineConsultFaq3Q"), answer: t("onlineConsultFaq3A") },
          ]),
        ]}
      />
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("onlineConsultHeroEyebrow")}
        title={t("onlineConsultHeroTitle")}
        highlight={t("onlineConsultHeroHighlight")}
        subtitle={t("onlineConsultHeroSubtitle")}
        primaryCta={{ label: t("onlineConsultHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("onlineConsultHeroSecondaryCta"), href: "/si-funksionon" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={t("onlineConsultHeroImageAlt")}
        chip={t("onlineConsultHeroChip")}
        metaText={t("onlineConsultHeroMeta")}
        floatingText={t("onlineConsultHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("onlineConsultBenefitsEyebrow")}</div>
          <h2 className="website-section-title">{t("onlineConsultBenefitsTitle")}</h2>
          <p className="website-section-body">{t("onlineConsultBenefitsSubtitle")}</p>
          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("onlineConsultBenefit1Title"),
                  description: t("onlineConsultBenefit1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("onlineConsultBenefit2Title"),
                  description: t("onlineConsultBenefit2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 10h8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("onlineConsultBenefit3Title"),
                  description: t("onlineConsultBenefit3Desc"),
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
            eyebrow={t("onlineConsultStepsEyebrow")}
            title={t("onlineConsultStepsTitle")}
            body={t("onlineConsultStepsSubtitle")}
            bullets={[
              t("onlineConsultStep1Title"),
              t("onlineConsultStep2Title"),
              t("onlineConsultStep3Title"),
            ]}
            imageSrc="/api/images?key=dashboard"
            imageAlt={t("onlineConsultStepsImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("onlineConsultCtaTitle")}
            subtitle={t("onlineConsultCtaSubtitle")}
            primary={{ label: t("onlineConsultCtaPrimary"), href: "/register" }}
            secondary={{ label: t("onlineConsultCtaSecondary"), href: "/pricing" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
