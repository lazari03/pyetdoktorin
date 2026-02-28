import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteSplitSection from "@/presentation/components/website/WebsiteSplitSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMedicalOrganizationSchema, buildMedicalWebPageSchema, buildFaqSchema, buildPhysicianSchema } from "../seo";

export default async function PsikologOnlinePage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildPhysicianSchema({
            name: t("psychSchemaPhysicianName"),
            specialty: t("psychSchemaSpecialty"),
            path: "/psikolog-online",
          }),
          buildMedicalWebPageSchema({
            title: t("psychMetaTitle"),
            description: t("psychMetaDescription"),
            path: "/psikolog-online",
          }),
          buildFaqSchema([
            { question: t("psychFaq1Q"), answer: t("psychFaq1A") },
            { question: t("psychFaq2Q"), answer: t("psychFaq2A") },
            { question: t("psychFaq3Q"), answer: t("psychFaq3A") },
          ]),
        ]}
      />
      <WebsiteHero
        className="website-hero--individuals"
        eyebrow={t("psychHeroEyebrow")}
        title={t("psychHeroTitle")}
        highlight={t("psychHeroHighlight")}
        subtitle={t("psychHeroSubtitle")}
        primaryCta={{ label: t("psychHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("psychHeroSecondaryCta"), href: "/si-funksionon" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={t("psychHeroImageAlt")}
        chip={t("psychHeroChip")}
        metaText={t("psychHeroMeta")}
        floatingText={t("psychHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("psychBenefitsEyebrow")}</div>
          <h2 className="website-section-title">{t("psychBenefitsTitle")}</h2>
          <p className="website-section-body">{t("psychBenefitsSubtitle")}</p>
          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("psychBenefit1Title"),
                  description: t("psychBenefit1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("psychBenefit2Title"),
                  description: t("psychBenefit2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 10h8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("psychBenefit3Title"),
                  description: t("psychBenefit3Desc"),
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
            eyebrow={t("psychStepsEyebrow")}
            title={t("psychStepsTitle")}
            body={t("psychStepsSubtitle")}
            bullets={[
              t("psychStep1"),
              t("psychStep2"),
              t("psychStep3"),
            ]}
            imageSrc="/api/images?key=child1"
            imageAlt={t("psychStepsImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("psychCtaTitle")}
            subtitle={t("psychCtaSubtitle")}
            primary={{ label: t("psychCtaPrimary"), href: "/register" }}
            secondary={{ label: t("psychCtaSecondary"), href: "/pricing" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
