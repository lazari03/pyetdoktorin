import { cookies } from 'next/headers';
import NavBar from './navBar';
import { AUTH_COOKIE_NAMES } from '@/config/cookies';
import { getRequestLocale, getServerTranslations } from '@/i18n/serverTranslations';

export default async function NavBarServer() {
  const [cookieStore, locale] = await Promise.all([cookies(), getRequestLocale()]);
  const t = await getServerTranslations(locale);
  const hasSession = Boolean(cookieStore.get(AUTH_COOKIE_NAMES.session)?.value);

  const navItems = [
    { path: '/si-funksionon', label: t('howItWorks') },
    { path: '/services', label: t('services') },
    { path: '/blog', label: t('blog') },
    { path: '/pricing', label: t('pricing') },
    { path: '/about', label: t('about') || t('aboutUs') },
    { path: '/contact', label: t('contact') },
  ].filter((item) => item.label);

  return (
    <NavBar
      hasSession={hasSession}
      navItems={navItems}
      labels={{
        menu: locale === 'en' ? 'Menu' : 'Meny',
        goToDashboard: t('goToDashboard'),
        signIn: t('signIn'),
        registerNow: t('registerNow'),
        mobileDescription: t('homeHeroSubtitle'),
      }}
    />
  );
}
