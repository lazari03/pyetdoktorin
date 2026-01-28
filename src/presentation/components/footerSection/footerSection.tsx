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
    <footer className="website-footer">
      <div className="website-container">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <div className="text-xl font-semibold text-white">ALO DOKTOR</div>
            <p className="text-sm text-slate-300 max-w-xs">
              {t('footerTagline') || 'Modern care delivery for clinics, clinicians, and patients worldwide.'}
            </p>
            <div>
              <label htmlFor="footer-lang" className="sr-only">
                {t('language')}
              </label>
              <select
                id="footer-lang"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="font-semibold text-white mb-3">{t('platform')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">{t('forProviders')}</a></li>
                <li><a href="#" className="hover:text-white">{t('forClinics')}</a></li>
                <li><a href="#" className="hover:text-white">{t('forPatients')}</a></li>
                <li><a href="#" className="hover:text-white">{t('pricing')}</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('company')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">{t('aboutUs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('careers')}</a></li>
                <li><a href="#" className="hover:text-white">{t('contact')}</a></li>
                <li><a href="#" className="hover:text-white">{t('privacySecurity')}</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('resources')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">{t('blog')}</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('support')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">{t('helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('termsOfService')}</a></li>
                <li><a href="#" className="hover:text-white">{t('privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-white">{t('status')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-400">
          &copy; {year} {t('companyName')}. {t('allRightsReserved')}
        </div>
      </div>
    </footer>
  );
}
