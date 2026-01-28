"use client";

import { useTranslation } from "react-i18next";

export default function FooterSection() {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'sq', label: 'Shqip' },
    // Add more as needed
  ];

  return (
    <footer className="w-full bg-white text-[#0a2e2e] pt-12 pb-4 px-4 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        {/* Language selector and copyright */}
        <div className="flex flex-col gap-8 md:gap-0 md:justify-between md:h-full min-w-[220px]">
          <div>
            <label htmlFor="footer-lang" className="sr-only">{t('language')}</label>
            <select
              id="footer-lang"
              className="w-full border-2 border-[#0a2e2e] rounded-xl py-4 px-6 text-lg font-semibold bg-white text-[#0a2e2e] focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
              value={i18n.language}
              onChange={e => i18n.changeLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div className="hidden md:block mt-8 text-sm text-[#0a2e2e]">&copy; {year} {t('companyName')}. {t('allRightsReserved')}</div>
        </div>
        {/* Footer columns */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold mb-3 text-[#0a2e2e]">{t('platform')}</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">{t('forProviders')}</a></li>
              <li><a href="#" className="hover:underline">{t('forClinics')}</a></li>
              <li><a href="#" className="hover:underline">{t('forPatients')}</a></li>
              <li><a href="#" className="hover:underline">{t('pricing')}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-[#0a2e2e]">{t('company')}</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">{t('aboutUs')}</a></li>
              <li><a href="#" className="hover:underline">{t('careers')}</a></li>
              <li><a href="#" className="hover:underline">{t('contact')}</a></li>
              <li><a href="#" className="hover:underline">{t('privacySecurity')}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-[#0a2e2e]">{t('resources')}</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">{t('blog')}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-[#0a2e2e]">{t('support')}</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">{t('helpCenter')}</a></li>
              <li><a href="#" className="hover:underline">{t('termsOfService')}</a></li>
              <li><a href="#" className="hover:underline">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:underline">{t('status')}</a></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright and social icons for mobile */}
      <div className="md:hidden mt-8 text-sm text-[#0a2e2e] text-center">&copy; {year} {t('companyName')}. {t('allRightsReserved')}</div>
    </footer>
  );
}
