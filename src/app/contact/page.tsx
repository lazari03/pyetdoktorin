"use client";

import "../styles.css";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteStatsStrip from "@/presentation/components/website/WebsiteStatsStrip";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function ContactPageInner() {
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const allowRecaptchaBypass =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_RECAPTCHA_OPTIONAL === "true";
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let token: string | null = null;
    if (executeRecaptcha) {
      token = await executeRecaptcha("contact");
    }
    if (!token && !allowRecaptchaBypass) {
      alert(t("recaptchaUnavailable") || "reCAPTCHA unavailable. Please refresh the page.");
      return;
    }
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const message = messageRef.current?.value || "";
    // Verify token with backend
    if (token) {
      const recaptchaRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        alert(t('recaptchaFailed'));
        return;
      }
    }
    // Only proceed with sending email if reCAPTCHA passes
    const res = await fetch("/api/contact/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(t('messageSent'));
    } else {
      alert(data.message || t('failedToSendMessage'));
    }
  };

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
                <div>{t('email')}: <a className="text-purple-600" href="mailto:support@pyetDoktorin.com">support@pyetDoktorin.com</a></div>
                <div>{t('supportHours')}</div>
              </div>
            </div>
            <div className="website-card">
              <form className="flex flex-col gap-4" onSubmit={handleContactSubmit}>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder={t('yourName')}
                  className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  ref={emailRef}
                  type="email"
                  placeholder={t('yourEmail')}
                  className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <textarea
                  ref={messageRef}
                  placeholder={t('yourMessage')}
                  className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  className="rounded-full bg-purple-600 text-white font-semibold py-3 px-6 hover:bg-purple-500 transition"
                >
                  {t('sendMessage')}
                </button>
              </form>
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

export default function ContactPage() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      scriptProps={{ async: true, appendTo: "head" }}
    >
      <ContactPageInner />
    </GoogleReCaptchaProvider>
  );
}
