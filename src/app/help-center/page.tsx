import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteFeatureGrid from "@/presentation/components/website/WebsiteFeatureGrid";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";

export default async function HelpCenterPage() {
  const t = await getServerTranslations();

  const topics = [
    {
      title: t("helpTopic1Title"),
      description: t("helpTopic1Desc"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: t("helpTopic2Title"),
      description: t("helpTopic2Desc"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 4v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: t("helpTopic3Title"),
      description: t("helpTopic3Desc"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 4h12v6H6z" stroke="currentColor" strokeWidth="2" />
          <path d="M6 14h12v6H6z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const faqs = [
    { question: t("helpFaq1Q"), answer: t("helpFaq1A") },
    { question: t("helpFaq2Q"), answer: t("helpFaq2A") },
    { question: t("helpFaq3Q"), answer: t("helpFaq3A") },
    { question: t("helpFaq4Q"), answer: t("helpFaq4A") },
  ];

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--individuals"
        variant="centered"
        eyebrow={t("helpCenterEyebrow")}
        title={t("helpCenter")}
        subtitle={t("helpCenterSubtitle")}
        primaryCta={{ label: t("helpCenterPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("home"), href: "/" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("helpCenterSectionEyebrow")}</div>
          <h2 className="website-section-title">{t("helpCenterSectionTitle")}</h2>
          <p className="website-section-body">{t("helpCenterSectionSubtitle")}</p>

          <div className="mt-10">
            <WebsiteFeatureGrid features={topics} />
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <div className="website-pill">{t("helpFaqEyebrow")}</div>
          <h2 className="website-section-title">{t("helpFaqTitle")}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="website-card">
                <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection>
        <div className="website-container">
          <WebsiteCta
            title={t("helpCtaTitle")}
            subtitle={t("helpCtaSubtitle")}
            primary={{ label: t("helpCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("helpCtaSecondary"), href: "/register" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
