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

export default async function ServicesPage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildMedicalWebPageSchema({
            title: t("servicesMetaTitle"),
            description: t("servicesMetaDescription"),
            path: "/services",
          }),
          buildFaqSchema([
            { question: t("servicesFaq1Q"), answer: t("servicesFaq1A") },
            { question: t("servicesFaq2Q"), answer: t("servicesFaq2A") },
            { question: t("servicesFaq3Q"), answer: t("servicesFaq3A") },
          ]),
        ]}
      />
      <WebsiteHero
        className="website-hero--doctors"
        eyebrow={t("servicesHeroEyebrow")}
        title={t("servicesHeroTitle")}
        highlight={t("servicesHeroHighlight")}
        subtitle={t("servicesHeroSubtitle")}
        primaryCta={{ label: t("servicesHeroPrimaryCta"), href: "/register" }}
        secondaryCta={{ label: t("servicesHeroSecondaryCta"), href: "/si-funksionon" }}
        imageSrc="/api/images?key=child1"
        imageAlt={t("servicesHeroImageAlt")}
        chip={t("servicesHeroChip")}
        metaText={t("servicesHeroMeta")}
        floatingText={t("servicesHeroFloating")}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("servicesSpecialtiesEyebrow")}</div>
          <h2 className="website-section-title">{t("servicesSpecialtiesTitle")}</h2>
          <p className="website-section-body">{t("servicesSpecialtiesSubtitle")}</p>

          <div className="mt-10">
            <WebsiteFeatureGrid
              features={[
                {
                  title: t("servicesFeature1Title"),
                  description: t("servicesFeature1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesFeature2Title"),
                  description: t("servicesFeature2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 20c1.5-4 7.5-4 9 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16 7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesFeature3Title"),
                  description: t("servicesFeature3Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3c3 4 5 6 5 9a5 5 0 1 1-10 0c0-3 2-5 5-9z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty1Title"),
                  description: t("servicesSpecialty1Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.4-7 10-7 10z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty2Title"),
                  description: t("servicesSpecialty2Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M6 12a6 6 0 0 1 12 0c0 3-2.5 5-6 9-3.5-4-6-6-6-9z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty3Title"),
                  description: t("servicesSpecialty3Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty4Title"),
                  description: t("servicesSpecialty4Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 20c1.5-3.5 10.5-3.5 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty5Title"),
                  description: t("servicesSpecialty5Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4c4 0 7 3 7 7 0 5-4 9-7 9s-7-4-7-9c0-4 3-7 7-7z" stroke="currentColor" strokeWidth="2" />
                      <path d="M15 4c2 0 3-1 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: t("servicesSpecialty6Title"),
                  description: t("servicesSpecialty6Desc"),
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="2" />
                      <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
            eyebrow={t("servicesPharmacyEyebrow")}
            title={t("servicesPharmacyTitle")}
            body={t("servicesPharmacyBody")}
            bullets={[
              t("servicesPharmacyBullet1"),
              t("servicesPharmacyBullet2"),
              t("servicesPharmacyBullet3"),
            ]}
            imageSrc="/api/images?key=dashboard"
            imageAlt={t("servicesPharmacyImageAlt")}
            reverse
          />
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteCta
            title={t("servicesCtaTitle")}
            subtitle={t("servicesCtaSubtitle")}
            primary={{ label: t("servicesCtaPrimary"), href: "/register" }}
            secondary={{ label: t("servicesCtaSecondary"), href: "/contact" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
