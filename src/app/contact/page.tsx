"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function ContactPageInner() {
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) return;
    const token = await executeRecaptcha("contact");
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const message = messageRef.current?.value || "";
    // Verify token with backend
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
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-orange-500 to-orange-100 pb-20 pt-16 md:pt-24 text-black overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('contactUs')}</h1>
          <p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">{t('contactUsDescription')}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:underline cursor-pointer"><Link href="/">{t('home')}</Link></span>
            <span>/</span>
            <span className="font-semibold text-orange-500">{t('contact')}</span>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
      </section>

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
        <div className="max-w-5xl w-full flex flex-col gap-20 animate-fade-in">
          {/* Section 1 & 2: Contact Info/Intro and Contact Form side by side */}
          <section className="flex flex-col md:flex-row items-stretch gap-10 md:gap-20">
            {/* Left: Info */}
            <div className="md:w-1/2 w-full flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('getInTouchWithTeam')}</h2>
              <p className="text-base md:text-lg text-gray-700 mb-4">
                {t('getInTouchDescription')}
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <span className="font-semibold">{t('email')}: <a href="mailto:info@portokalle.com" className="text-orange-500 hover:underline">support@portokalle.com</a></span>
              </div>
            </div>
            {/* Right: Form */}
            <div className="md:w-1/2 w-full flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('sendUsMessage')}</h2>
              <form className="flex flex-col gap-4" onSubmit={handleContactSubmit}>
                <input ref={nameRef} type="text" placeholder={t('yourName')} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                <input ref={emailRef} type="email" placeholder={t('yourEmail')} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                <textarea ref={messageRef} placeholder={t('yourMessage')} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" rows={4} required />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">{t('sendMessage')}</button>
              </form>
            </div>
          </section>

          {/* Section 3: Stats */}
          <section className="w-full flex flex-wrap justify-center gap-8 py-10 bg-orange-500 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-white">24/7</span>
              <span className="text-base text-orange-100">{t('support')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-white">100%</span>
              <span className="text-base text-orange-100">{t('responseRate')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-white">10+</span>
              <span className="text-base text-orange-100">{t('teamMembers')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-white">5+</span>
              <span className="text-base text-orange-100">{t('languagesSupported')}</span>
            </div>
          </section>

          {/* Section 4: Features/Benefits */}
          <section className="w-full grid md:grid-cols-3 gap-8 bg-white rounded-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">{t('fastResponse')}</h3>
              <p className="text-gray-700">{t('fastResponseDescription')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">{t('multiChannel')}</h3>
              <p className="text-gray-700">{t('multiChannelDescription')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">{t('securePrivate')}</h3>
              <p className="text-gray-700">{t('securePrivateDescription')}</p>
            </div>
          </section>
        </div>
      </main>
      <FooterSection />
    </div>
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
