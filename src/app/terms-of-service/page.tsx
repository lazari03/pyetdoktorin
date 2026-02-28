import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import { buildMetadata, SEO_KEYWORDS_AL } from "../seo";

export async function generateMetadata() {
  const t = await getServerTranslations();
  return buildMetadata({
    title: t("termsMetaTitle"),
    description: t("termsMetaDescription"),
    path: "/terms-of-service",
    keywords: SEO_KEYWORDS_AL,
  });
}

export default async function TermsOfServicePage() {
  const t = await getServerTranslations();

  const sections = [
    { title: t("termsSummaryTitle"), body: t("termsSummaryBody") },
    { title: t("termsAccountTitle"), body: t("termsAccountBody") },
    { title: t("termsUseTitle"), body: t("termsUseBody") },
    { title: t("termsPaymentTitle"), body: t("termsPaymentBody") },
    { title: t("termsPrivacyTitle"), body: t("termsPrivacyBody") },
    { title: t("termsTerminationTitle"), body: t("termsTerminationBody") },
    { title: t("termsContactTitle"), body: t("termsContactBody") },
  ];

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--clinics"
        variant="centered"
        eyebrow={t("termsEyebrow")}
        title={t("termsOfService")}
        subtitle={t("termsSubtitle")}
        primaryCta={{ label: t("termsPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("home"), href: "/" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("termsSectionEyebrow")}</div>
          <h2 className="website-section-title">{t("termsSectionTitle")}</h2>
          <p className="website-section-body">{t("termsSectionSubtitle")}</p>

          <div className="mt-10 grid gap-6">
            {sections.map((section) => (
              <div key={section.title} className="website-card">
                <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("termsCtaTitle")}
            subtitle={t("termsCtaSubtitle")}
            primary={{ label: t("termsCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("termsCtaSecondary"), href: "/privacy-policy" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
