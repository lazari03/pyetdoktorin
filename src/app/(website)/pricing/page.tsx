import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { getServerTranslations } from "@/i18n/serverTranslations";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMedicalOrganizationSchema, buildMedicalWebPageSchema, buildMetadata, SEO_KEYWORDS_AL } from "@/app/seo";

export async function generateMetadata() {
  const t = await getServerTranslations();
  return buildMetadata({
    title: t("pricingMetaTitle"),
    description: t("pricingMetaDescription"),
    path: "/pricing",
    keywords: SEO_KEYWORDS_AL,
  });
}

export default async function PricingPage() {
  const t = await getServerTranslations();

  const plans = [
    {
      kind: "public" as const,
      name: t("pricingPlanStarterName"),
      badge: t("pricingPublicBadge"),
      price: t("pricingPlanStarterPrice"),
      description: t("pricingPlanStarterDesc"),
      ctaLabel: t("register"),
      ctaHref: "/register",
      features: [
        t("pricingPlanStarterFeature1"),
        t("pricingPlanStarterFeature2"),
        t("pricingPlanStarterFeature3"),
      ],
    },
    {
      kind: "sales" as const,
      name: t("pricingPlanGrowthName"),
      badge: t("pricingSalesBadge"),
      price: t("pricingPlanGrowthPrice"),
      description: t("pricingPlanGrowthDesc"),
      ctaLabel: t("pricingCtaPrimary"),
      ctaHref: "/contact",
      features: [
        t("pricingPlanGrowthFeature1"),
        t("pricingPlanGrowthFeature2"),
        t("pricingPlanGrowthFeature3"),
      ],
    },
    {
      kind: "sales" as const,
      name: t("pricingPlanEnterpriseName"),
      badge: t("pricingSalesBadge"),
      price: t("pricingPlanEnterprisePrice"),
      description: t("pricingPlanEnterpriseDesc"),
      ctaLabel: t("pricingCtaPrimary"),
      ctaHref: "/contact",
      features: [
        t("pricingPlanEnterpriseFeature1"),
        t("pricingPlanEnterpriseFeature2"),
        t("pricingPlanEnterpriseFeature3"),
      ],
    },
  ];

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalOrganizationSchema(),
          buildMedicalWebPageSchema({
            title: t("pricingMetaTitle"),
            description: t("pricingMetaDescription"),
            path: "/pricing",
          }),
        ]}
      />
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
              <div
                key={plan.name}
                className={`website-card pricing-plan-card ${plan.kind === "public" ? "pricing-plan-card--featured" : "pricing-plan-card--sales"} flex flex-col gap-6`}
              >
                <div>
                  <div className="pricing-plan-header">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">{plan.name}</div>
                    <span
                      className={`pricing-plan-badge ${plan.kind === "public" ? "pricing-plan-badge--featured" : "pricing-plan-badge--sales"}`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  <div
                    className={`pricing-plan-price ${plan.kind === "public" ? "pricing-plan-price--featured" : "pricing-plan-price--sales"}`}
                  >
                    {plan.price}
                  </div>
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
                <div className="pricing-plan-actions mt-auto pt-2">
                  <a
                    href={plan.ctaHref}
                    className={`website-btn ${plan.kind === "public" ? "website-btn-solid" : "website-btn-ghost"}`}
                  >
                    {plan.ctaLabel}
                  </a>
                </div>
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
