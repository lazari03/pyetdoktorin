"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function FooterSection() {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full bg-white text-gray-400 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
  <Image src="/img/logo.png" alt={t('portokalleLogoAlt')} width={200} height={80} className="mb-3 w-3/5 h-auto max-w-xs object-contain" priority />
        <span className="text-lg font-semibold text-white">{t('companyName')}</span>
        <span className="text-xs text-gray-500 mb-2">{t('footerTagline')}</span>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <a href="/about" className="text-black hover:text-orange-500 transition-colors">{t('aboutUs')}</a>
          <a href="/contact" className="text-black hover:text-orange-500 transition-colors">{t('contact')}</a>
          <a href="/jobs" className="text-black hover:text-orange-500 transition-colors">{t('jobs')}</a>
          <a href="/privacy-policy" className="text-black hover:text-orange-500 transition-colors">{t('privacyPolicy')}</a>
        </div>
        <span className="text-[11px] text-gray-600 mt-4">&copy; {new Date().getFullYear()} {t('companyName')}. {t('allRightsReserved')}</span>
      </div>
    </footer>
  );
}
