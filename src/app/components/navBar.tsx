"use client";

import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import '@i18n';
import Image from 'next/image';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const nav = useNavigationCoordinator();
  const { isAuthenticated, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState(i18n.language);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [hasAuthCookie, setHasAuthCookie] = useState(false);

  const handleLanguageChange = (lng: string) => {
    document.cookie = `language=${lng}; path=/; max-age=31536000`;
    i18n.changeLanguage(lng);
    setLang(lng);
    setShowLangMenu(false);
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    nav.toLogin();
  };

  const handleSignUpClick = () => {
    setIsMenuOpen(false);
    nav.toRegister();
  };

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    nav.toDashboard();
  };

  const handleNavItemClick = (path: string) => {
    setIsMenuOpen(false);
    nav.pushPath(path);
  };


  // Lock scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Keep a cookie-based guard in sync with Firebase auth to avoid false "Go to Dashboard" on first load
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookieStr = document.cookie || '';
      // With HttpOnly session, we cannot check it client-side.
      // Use the presence of a non-sensitive 'loggedIn' and 'userRole' to decide UI affordances.
      const loggedIn = /(?:^|; )loggedIn=/.test(cookieStr);
      const hasRole = /(?:^|; )userRole=/.test(cookieStr);
      setHasAuthCookie(loggedIn && hasRole);
    }
  }, [isAuthenticated, loading]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] drop-shadow-xl">
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-200 ease-in-out z-[9998] animate-fade-in"
          style={{ pointerEvents: 'auto' }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {/* Main NavBar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-5 mt-4 h-24 md:h-auto rounded-2xl bg-white shadow-lg relative flex items-center justify-between z-[9999]">
        {/* Left - Hamburger or X */}
        <div className="md:hidden z-[10000]">
          <button className="text-[#ea580c]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8 text-[#ea580c]" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-[#ea580c]" />
            )}
          </button>
        </div>
        {/* Center - Logo */}
        <div className="absolute inset-x-0 flex justify-center z-[9999]">
          <Link href="/">
            <Image
              src="/img/logo.png"
              alt="Portokalle Health"
              width={140}
              height={60}
              priority
            />
          </Link>
        </div>
        {/* Right - Mobile Language Switcher Only */}
        <div className="md:hidden z-[10000] flex items-center ml-2">
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 transition-colors shadow focus:outline-none ${showLangMenu ? 'ring-2 ring-[#ea580c]' : ''}`}
            style={{ transition: 'background 0.2s' }}
            onClick={() => setShowLangMenu((v) => !v)}
            aria-label="Select language"
            type="button"
          >
            <span className="text-xl">
              {lang === 'en' ? '🇬🇧' : lang === 'al' ? '🇦🇱' : '🌐'}
            </span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-2 animate-fade-in">
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'en' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                onClick={() => handleLanguageChange('en')}
                aria-label="Switch to English"
              >
                <span role="img" aria-label="English">🇬🇧</span> {t('english')}
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'al' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                onClick={() => handleLanguageChange('al')}
                aria-label="Switch to Albanian"
              >
                <span role="img" aria-label="Albanian">🇦🇱</span> {t('albanian')}
              </button>
            </div>
          )}
        </div>
        {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10 text-[15px] font-medium text-gray-800 z-[9999]">
            <a href="#" className="text-black hover:text-[#ea580c] cursor-pointer" onClick={() => handleNavItemClick('/individuals')}>
              {t('individuals')}
            </a>
            <a href="#" className="text-black hover:text-[#ea580c] cursor-pointer" onClick={() => handleNavItemClick('/doctors')}>
              {t('doctors')}
            </a>
            <a href="#" className="text-black hover:text-[#ea580c] cursor-pointer" onClick={() => handleNavItemClick('/clinicians')}>
              {t('clinicians')}
            </a>
          </nav>
        {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 ml-auto z-[9999]">
          {!loading && (
            (isAuthenticated && hasAuthCookie) ? (
              <button
                className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
                onClick={handleDashboardClick}
              >
                {t('goToDashboard') || 'Go to Dashboard'}
              </button>
            ) : (
              <>
                <button className="text-[#ea580c] hover:underline font-medium cursor-pointer" onClick={handleLoginClick}>
                  {t('signIn')}
                </button>
                <button className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-700 transition-colors cursor-pointer" onClick={handleSignUpClick}>
                  {t('registerNow')}
                </button>
              </>
            )
          )}
          {/* Language Switcher with Flags - Desktop */}
          <div className="flex items-center ml-4 relative">
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 transition-colors shadow focus:outline-none ${showLangMenu ? 'ring-2 ring-[#ea580c]' : ''}`}
              style={{ transition: 'background 0.2s' }}
              onClick={() => setShowLangMenu((v) => !v)}
              aria-label="Select language"
              type="button"
            >
              <span className="text-xl">
                {lang === 'en' ? '🇬🇧' : lang === 'al' ? '🇦🇱' : '🌐'}
              </span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-2 animate-fade-in">
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'en' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                  onClick={() => handleLanguageChange('en')}
                  aria-label="Switch to English"
                >
                  <span role="img" aria-label="English">🇬🇧</span> {t('english')}
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-orange-50 transition-colors ${lang === 'al' ? 'font-bold text-[#ea580c]' : 'text-gray-700'}`}
                  onClick={() => handleLanguageChange('al')}
                  aria-label="Switch to Albanian"
                >
                  <span role="img" aria-label="Albanian">🇦🇱</span> {t('albanian')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-[10001] flex flex-col rounded-b-2xl rounded-t-2xl overflow-hidden">
          {/* Menu Items */}
          <nav className="flex flex-col">
            <Link href="/individuals" className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer" onClick={() => handleNavItemClick('/individuals')}>
              {t('individuals')}
            </Link>
            <Link href="/doctors" className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer" onClick={() => handleNavItemClick('/doctors')}>
              {t('doctors')}
            </Link>
            <Link href="/clinicians" className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer" onClick={() => handleNavItemClick('/clinicians')}>
              {t('clinicians')}
            </Link>
          </nav>
          {/* Mobile Bottom Buttons */}
          <div className="p-4 border-t border-gray-100">
            {!loading && (
              (isAuthenticated && hasAuthCookie) ? (
                <button
                  className="bg-[#ea580c] text-white rounded-full py-3 px-6 w-full font-semibold cursor-pointer text-lg shadow-md active:scale-95 transition-all"
                  onClick={handleDashboardClick}
                >
                  {t('goToDashboard') || 'Go to Dashboard'}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    className="flex items-center justify-center gap-2 text-[#ea580c] border border-[#ea580c] bg-white rounded-full py-3 px-6 w-full font-semibold cursor-pointer text-lg shadow-md active:scale-95 transition-all"
                    onClick={handleLoginClick}
                  >
                    <i className="fa-solid fa-arrow-right text-lg" />
                    <span>{t('signIn')}</span>
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 text-white bg-[#ea580c] rounded-full py-3 px-6 w-full font-semibold cursor-pointer text-lg shadow-md active:scale-95 transition-all"
                    onClick={handleSignUpClick}
                  >
                    <i className="fa-solid fa-user-plus text-lg" />
                    <span>{t('registerNow')}</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}