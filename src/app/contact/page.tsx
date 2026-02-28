import "../styles.css";
import React from "react";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import { getServerTranslations } from "@/i18n/serverTranslations";
import ContactForm from "./ContactForm";

export default async function ContactPage() {
  const t = await getServerTranslations();
  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--contact"
        variant="centered"
        eyebrow={t('contactHeroEyebrow')}
        title={t('contactUs')}
        subtitle={t('contactUsDescription')}
        primaryCta={{ label: t('sendMessage'), href: '#contact-form' }}
        secondaryCta={{ label: t('home'), href: '/' }}
        metaText={t('contactHeroMeta')}
      />

      <WebsiteSection>
        <div className="website-container" id="contact-form">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <div className="website-pill">{t('getInTouchWithTeam')}</div>
              <h2 className="website-section-title">{t('sendUsMessage')}</h2>
              <p className="website-section-body">{t('getInTouchDescription')}</p>
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div>
                  {t('email')}:{' '}
                  <a className="text-purple-600" href="mailto:atelemedicine30@gmail.com">
                    atelemedicine30@gmail.com
                  </a>
                </div>
                <div>{t('supportHours')}</div>
              </div>
            </div>
            <div className="website-card">
              <ContactForm
                namePlaceholder={t("yourName")}
                emailPlaceholder={t("yourEmail")}
                messagePlaceholder={t("yourMessage")}
                submitLabel={t("sendMessage")}
                successMessage={t("messageSent")}
                errorMessage={t("failedToSendMessage")}
              />
            </div>
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteStatsStrip
            stats={[
              { value: "24/7", label: t('support') },
              { value: "100%", label: t('responseRate') },
              { value: "10+", label: t('teamMembers') },
              { value: "5+", label: t('languagesSupported') },
            ]}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}
