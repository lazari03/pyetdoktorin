"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <section className="relative w-full bg-gradient-to-b from-orange-500 to-orange-100 pb-20 pt-16 md:pt-24 text-black overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('privacyPolicy')}</h1>
          <p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">{t('privacyPolicySubtitle')}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:underline cursor-pointer"><Link href="/">{t('home')}</Link></span>
            <span>/</span>
            <span className="font-semibold text-orange-500">{t('privacyPolicy')}</span>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
      </section>
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
        <div className="max-w-3xl w-full flex flex-col gap-10 animate-fade-in">
          <section className="bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy')}</h2>
            <p className="text-gray-700 mb-4">{t('privacyPolicyIntro')}</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('whatDataWeCollect')}</h2>
            <p className="text-gray-700 mb-2">{t('whatDataWeCollectText')}</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('howYourDataIsStored')}</h2>
            <p className="text-gray-700 mb-2">{t('howYourDataIsStoredText')}</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('yourRights')}</h2>
            <p className="text-gray-700 mb-2">{t('yourRightsText')} <a href="mailto:info@portokalle.al" className="text-orange-500 hover:underline">info@portokalle.al</a>.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('dataProtectionStandards')}</h2>
            <p className="text-gray-700 mb-2">{t('dataProtectionStandardsText')}</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('security')}</h2>
            <p className="text-gray-700 mb-2">{t('securityText')}</p>
            <h2 className="text-xl font-bold mt-8 mb-2">{t('policyUpdates')}</h2>
            <p className="text-gray-700 mb-2">{t('policyUpdatesText')}</p>
          </section>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
