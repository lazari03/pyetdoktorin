import "../styles.css";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";

export default async function JobsPage() {
  const t = await getServerTranslations();

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--clinics"
        variant="centered"
        eyebrow={t("careers")}
        title={t("jobs")}
        subtitle={t("jobsDescription")}
        primaryCta={{ label: t("contact"), href: "/contact" }}
        secondaryCta={{ label: t("home"), href: "/" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-card text-center">
            <h2 className="website-section-title">{t("jobsWillBePostedHere")}</h2>
            <p className="website-section-body mx-auto">{t("noVacantPosition")}</p>
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("jobsCtaTitle")}
            subtitle={t("jobsCtaSubtitle")}
            primary={{ label: t("jobsCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("jobsCtaSecondary"), href: "/register" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
