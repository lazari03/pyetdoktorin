'use client';

import "../styles.css";
import { useTranslation } from "react-i18next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";

export default function PricingPage() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricingPlanStarterName"),
      price: t("pricingPlanStarterPrice"),
      description: t("pricingPlanStarterDesc"),
      features: [
        t("pricingPlanStarterFeature1"),
        t("pricingPlanStarterFeature2"),
        t("pricingPlanStarterFeature3"),
      ],
    },
    {
      name: t("pricingPlanGrowthName"),
      price: t("pricingPlanGrowthPrice"),
      description: t("pricingPlanGrowthDesc"),
      features: [
        t("pricingPlanGrowthFeature1"),
        t("pricingPlanGrowthFeature2"),
        t("pricingPlanGrowthFeature3"),
      ],
    },
    {
      name: t("pricingPlanEnterpriseName"),
      price: t("pricingPlanEnterprisePrice"),
      description: t("pricingPlanEnterpriseDesc"),
      features: [
        t("pricingPlanEnterpriseFeature1"),
        t("pricingPlanEnterpriseFeature2"),
        t("pricingPlanEnterpriseFeature3"),
      ],
    },
  ];

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--doctors"
        variant="centered"
        eyebrow={t("pricingEyebrow")}
        title={t("pricing")}
        subtitle={t("pricingSubtitle")}
        primaryCta={{ label: t("pricingPrimaryCta"), href: "/contact" }}
        secondaryCta={{ label: t("register"), href: "/register" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{t("pricingSectionEyebrow")}</div>
          <h2 className="website-section-title">{t("pricingSectionTitle")}</h2>
          <p className="website-section-body">{t("pricingSectionSubtitle")}</p>

          <div className="mt-10 website-grid">
            {plans.map((plan) => (
              <div key={plan.name} className="website-card flex flex-col gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">{plan.name}</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{plan.price}</div>
                  <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                </div>
                <ul className="website-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="website-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500">{t("pricingFootnote")}</p>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={t("pricingCtaTitle")}
            subtitle={t("pricingCtaSubtitle")}
            primary={{ label: t("pricingCtaPrimary"), href: "/contact" }}
            secondary={{ label: t("pricingCtaSecondary"), href: "/clinicians" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
