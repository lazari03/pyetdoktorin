"use client";
import "@/i18n/i18n";
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from '@/config/zIndex';

export type NavBarItem = {
  path: string;
  label: string;
};

type NavBarLabels = {
  menu: string;
  goToDashboard: string;
  signIn: string;
  registerNow: string;
  mobileDescription: string;
};

export default function NavBar({
  hasSession = false,
  navItems,
  labels,
}: {
  hasSession?: boolean;
  navItems: NavBarItem[];
  labels: NavBarLabels;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) =>
    (hasSession ? (
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
        onClick={() => mobile && setIsMenuOpen(false)}
        data-analytics="nav.goto_dashboard"
      >
        {labels.goToDashboard}
      </Link>
    ) : (
      <>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200"
          onClick={() => mobile && setIsMenuOpen(false)}
          data-analytics="nav.sign_in"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          {labels.signIn}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => mobile && setIsMenuOpen(false)}
          data-analytics="nav.register"
        >
          <UserPlusIcon className="h-4 w-4" />
          {labels.registerNow}
        </Link>
      </>
    ));

  return (
    <header className={`navbar-wrapper w-full sticky top-0 ${z.navbar}`}>
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-slate-900/45 backdrop-blur-sm transition-opacity duration-200 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${z.backdrop}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`fixed top-0 right-0 h-full w-[88%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          } ${z.drawer}`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{labels.menu}</span>
              <span className="text-lg font-bold text-slate-900">Pyet Doktorin</span>
            </div>
            <button
              className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
              aria-label={t('closeMenu')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-4 py-4" aria-label={t('mobileNavigation')}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-[15px] font-semibold transition ${
                  pathname === item.path ? 'bg-purple-50 text-purple-700' : 'text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                aria-current={pathname === item.path ? 'page' : undefined}
                data-analytics={`nav.mobile.${item.path}`}
              >
                <span className="truncate">{item.label}</span>
                <span className={`text-xs ${pathname === item.path ? 'text-purple-400' : 'text-slate-400'}`}>›</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 py-6 space-y-3 border-t border-slate-100 bg-slate-50/60">
            <AuthButtons mobile />
            <p className="text-xs text-slate-500">
              {labels.mobileDescription}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 md:px-10">
          <div className="md:hidden">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <Link href="/" className="select-none font-bold tracking-tight text-xl text-slate-900 md:text-2xl" data-analytics="nav.home">
            PYET <span className="text-purple-700">DOKTORIN</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center md:flex" aria-label={t('primaryNavigation')}>
            <div className="inline-flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(`${item.path}/`));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    aria-current={active ? 'page' : undefined}
                    data-analytics={`nav.desktop.${item.path}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}
