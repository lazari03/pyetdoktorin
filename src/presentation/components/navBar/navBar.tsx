"use client";
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import '@i18n';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { z } from '@/config/zIndex';

export default function NavBar() {
  const nav = useNavigationCoordinator();
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAuthCookie, setHasAuthCookie] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookieStr = document.cookie || '';
      setHasAuthCookie(/(?:^|; )loggedIn=/.test(cookieStr) && /(?:^|; )userRole=/.test(cookieStr));
    }
  }, [isAuthenticated, loading]);

  const navItems = [
    { path: '/pricing', label: t('pricing') },
    { path: '/about', label: t('about') || t('aboutUs') },
    { path: '/contact', label: t('contact') },
  ].filter(item => item.label);

  const AuthButtons = () =>
    !loading &&
    ((isAuthenticated && hasAuthCookie) ? (
      <button
        className="rounded-full bg-slate-900 px-5 py-2 text-white text-sm font-semibold hover:bg-slate-800 transition"
        onClick={() => {
          setIsMenuOpen(false);
          nav.toDashboard();
        }}
      >
        {t('goToDashboard')}
      </button>
    ) : (
      <>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
          onClick={() => {
            setIsMenuOpen(false);
            nav.toLogin();
          }}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          {t('signIn')}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => {
            setIsMenuOpen(false);
            nav.toRegister();
          }}
        >
          <UserPlusIcon className="h-4 w-4" />
          {t('registerNow')}
        </button>
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
          className={`fixed top-0 right-0 h-full w-[86%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          } ${z.drawer}`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Menu</span>
              <span className="text-lg font-bold text-slate-900">Pyet Doktorin</span>
            </div>
            <button
              className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 pt-4" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-slate-900 text-base font-semibold py-4 border-b border-slate-100 transition-colors hover:text-purple-600"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 py-6 space-y-3">
            <AuthButtons />
            <p className="text-xs text-slate-500">
              {t('homeHeroSubtitle')}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`w-full px-4 md:px-10 py-5 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="md:hidden">
          <button className="text-slate-900 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
          </button>
        </div>
        <div className="absolute left-0 right-0 flex justify-center md:justify-start md:static pointer-events-none md:pointer-events-auto">
          <Link
            href="/"
            className="pointer-events-auto select-none font-extrabold tracking-tight text-2xl md:text-3xl text-slate-900"
          >
            PYET <span className="text-purple-600">DOKTORIN</span>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-10 text-[15px] font-medium absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="text-slate-600 hover:text-purple-600 cursor-pointer transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
