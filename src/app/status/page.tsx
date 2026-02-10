'use client';

import "../styles.css";
import { useTranslation } from "react-i18next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";

export default function StatusPage() {
  const { t } = useTranslation();

  const components = [
    {
      name: t("statusComponentApi"),
      detail: t("statusComponentApiDetail"),
    },
    {
      name: t("statusComponentVideo"),
      detail: t("statusComponentVideoDetail"),
    },
    {
      name: t("statusComponentNotifications"),
      detail: t("statusComponentNotificationsDetail"),
    },
    {
      name: t("statusComponentPayments"),
      detail: t("statusComponentPaymentsDetail"),
    },
  ];

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--contact"
        variant="centered"
        eyebrow={t("statusEyebrow")}
        title={t("status")}
        subtitle={t("statusSubtitle")}
        primaryCta={{ label: t("statusPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("home"), href: "/" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("statusSectionEyebrow")}</div>
          <h2 className="website-section-title">{t("statusSectionTitle")}</h2>
          <p className="website-section-body">{t("statusSectionSubtitle")}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {components.map((component) => (
              <div key={component.name} className="website-card flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{component.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{component.detail}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {t("statusOperational")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 website-card">
            <h3 className="text-base font-semibold text-slate-900">{t("statusUpdateTitle")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("statusUpdateBody")}</p>
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("statusCtaTitle")}
            subtitle={t("statusCtaSubtitle")}
            primary={{ label: t("statusCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("statusCtaSecondary"), href: "/help-center" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
