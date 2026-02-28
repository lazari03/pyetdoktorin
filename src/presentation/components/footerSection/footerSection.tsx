"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function FooterSection() {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  const languages = [
    { code: 'en', label: t('english') },
    { code: 'al', label: t('albanian') },
  ];

  return (
    <footer className="website-footer">
      <div className="website-container">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <div className="text-xl font-semibold text-white">PYET DOKTORIN</div>
            <p className="text-sm text-slate-300 max-w-xs">
              {t('footerTagline')}
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
                <li><Link href="/doctors" className="hover:text-white">{t('forProviders')}</Link></li>
                <li><Link href="/clinicians" className="hover:text-white">{t('forClinics')}</Link></li>
                <li><Link href="/individuals" className="hover:text-white">{t('forPatients')}</Link></li>
                <li><Link href="/pricing" className="hover:text-white">{t('pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('company')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/about" className="hover:text-white">{t('aboutUs')}</Link></li>
                <li><Link href="/jobs" className="hover:text-white">{t('careers')}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t('contact')}</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white">{t('privacySecurity')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('resources')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/blog" className="hover:text-white">{t('blog')}</Link></li>
                <li><Link href="/konsulte-mjeku-online" className="hover:text-white">{t('onlineConsultHeroEyebrow')}</Link></li>
                <li><Link href="/recete-elektronike" className="hover:text-white">{t('eprescriptionHeroEyebrow')}</Link></li>
                <li><Link href="/psikolog-online" className="hover:text-white">{t('psychHeroEyebrow')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">{t('support')}</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="/help-center" className="hover:text-white">{t('helpCenter')}</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white">{t('termsOfService')}</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white">{t('privacyPolicy')}</Link></li>
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
