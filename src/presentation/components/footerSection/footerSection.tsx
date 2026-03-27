import Link from "next/link";
import FooterLanguageSelector from "./FooterLanguageSelector";
import { getRequestLocale, getServerTranslations } from "@/i18n/serverTranslations";

export default async function FooterSection() {
  const locale = await getRequestLocale();
  const t = await getServerTranslations(locale);
  const year = new Date().getFullYear();
  const languages = [
    { code: 'en' as const, label: `🇺🇸 ${t('english') || 'English'}` },
    { code: 'al' as const, label: `🇦🇱 ${t('albanian') || 'Shqip'}` },
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
              <FooterLanguageSelector
                currentLocale={locale}
                label={t('language')}
                options={languages}
              />
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
                <li><Link href="/status" className="hover:text-white">{t('status')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-400 flex flex-col gap-2">
          <div className="flex flex-wrap gap-4 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold border border-green-200">HTTPS</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">GDPR</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200">Të dhënat nuk shiten</span>
          </div>
          <div>
            &copy; {year} {t('companyName')}. {t('allRightsReserved')}
          </div>
        </div>
      </div>
    </footer>
  );
}
