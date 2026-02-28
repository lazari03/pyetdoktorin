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

export default async function ReceteElektronikePage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildMedicalWebPageSchema({
            title: t("eprescriptionMetaTitle"),
            description: t("eprescriptionMetaDescription"),
            path: "/recete-elektronike",
          }),
          buildFaqSchema([
            { question: t("eprescriptionFaq1Q"), answer: t("eprescriptionFaq1A") },
            { question: t("eprescriptionFaq2Q"), answer: t("eprescriptionFaq2A") },
            { question: t("eprescriptionFaq3Q"), answer: t("eprescriptionFaq3A") },
          ]),
        ]}
      />
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("eprescriptionHeroEyebrow")}
        title={t("eprescriptionHeroTitle")}
        highlight={t("eprescriptionHeroHighlight")}
        subtitle={t("eprescriptionHeroSubtitle")}
        primaryCta={{ label: t("eprescriptionHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("eprescriptionHeroSecondaryCta"), href: "/services" }}
        imageSrc="/api/images?key=dashboard"
        imageAlt={t("eprescriptionHeroImageAlt")}
        chip={t("eprescriptionHeroChip")}
        metaText={t("eprescriptionHeroMeta")}
        floatingText={t("eprescriptionHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("eprescriptionStepsEyebrow")}</div>
          <h2 className="website-section-title">{t("eprescriptionStepsTitle")}</h2>
          <p className="website-section-body">{t("eprescriptionStepsSubtitle")}</p>
          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("eprescriptionStep1Title"),
                  description: t("eprescriptionStep1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 10h8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("eprescriptionStep2Title"),
                  description: t("eprescriptionStep2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("eprescriptionStep3Title"),
                  description: t("eprescriptionStep3Desc"),
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
            eyebrow={t("eprescriptionBenefitsEyebrow")}
            title={t("eprescriptionBenefitsTitle")}
            body={t("eprescriptionBenefitsBody")}
            bullets={[
              t("eprescriptionBenefit1"),
              t("eprescriptionBenefit2"),
              t("eprescriptionBenefit3"),
            ]}
            imageSrc="/api/images?key=child1"
            imageAlt={t("eprescriptionBenefitsImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("eprescriptionCtaTitle")}
            subtitle={t("eprescriptionCtaSubtitle")}
            primary={{ label: t("eprescriptionCtaPrimary"), href: "/register" }}
            secondary={{ label: t("eprescriptionCtaSecondary"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
