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
  const [scrolled, setScrolled] = useState(false);

  // Listen for scroll to change navbar background
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigation items
  const navItems = [
    { path: '/individuals', label: t('individuals') },
    { path: '/doctors', label: t('doctors') },
    { path: '/clinicians', label: t('clinicians') },
  ].filter(item => item.label);

  // Language switcher
  const LanguageSwitcher = ({ className = '', desktop = false }) => (
    <div className={`relative ${className}`}>
      <button
        className={`flex items-center justify-center w-8 h-8 rounded-full ${scrolled ? 'bg-gray-100' : 'bg-white/20'} transition-colors shadow focus:outline-none ${showLangMenu ? 'ring-2 ring-[#ea580c]' : ''}`}
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
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col py-2 animate-fade-in">
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-purple-200 transition-colors ${lang === 'en' ? 'font-bold text-[#a78bfa]' : 'text-gray-700'}`}
            onClick={() => { setLang('en'); i18n.changeLanguage('en'); setShowLangMenu(false); document.cookie = `language=en; path=/; max-age=31536000`; }}
            aria-label="Switch to English"
          >
            <span role="img" aria-label="English">🇬🇧</span> {t('english')}
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-purple-200 transition-colors ${lang === 'al' ? 'font-bold text-[#a78bfa]' : 'text-gray-700'}`}
            onClick={() => { setLang('al'); i18n.changeLanguage('al'); setShowLangMenu(false); document.cookie = `language=al; path=/; max-age=31536000`; }}
            aria-label="Switch to Albanian"
          >
            <span role="img" aria-label="Albanian">🇦🇱</span> {t('albanian')}
          </button>
        </div>
      )}
    </div>
  );

  // Auth button logic
  const AuthButtons = () => (
    !loading && (
      (isAuthenticated && hasAuthCookie) ? (
        <button
          className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
          onClick={() => { setIsMenuOpen(false); nav.toDashboard(); }}
        >
          {t('goToDashboard') || 'Go to Dashboard'}
        </button>
      ) : (
        <>
          <button 
            className={`${scrolled ? 'text-gray-900' : 'text-white'} hover:underline font-medium cursor-pointer transition-colors`} 
            onClick={() => { setIsMenuOpen(false); nav.toLogin(); }}
          >
            {t('signIn')}
          </button>
          <button 
            className="bg-purple-500 text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-200 transition-colors cursor-pointer" 
            onClick={() => { setIsMenuOpen(false); nav.toRegister(); }}
          >
            {t('registerNow')}
          </button>
        </>
      )
    )
  );

  // Lock scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Cookie-based guard for dashboard button
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookieStr = document.cookie || '';
      const loggedIn = /(?:^|; )loggedIn=/.test(cookieStr);
      const hasRole = /(?:^|; )userRole=/.test(cookieStr);
      setHasAuthCookie(loggedIn && hasRole);
    }
  }, [isAuthenticated, loading]);

  return (
    <header className="w-full fixed top-0 left-0">
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-200 ease-in-out animate-fade-in"
          style={{ pointerEvents: 'auto' }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {/* Main NavBar */}
      <div
        className={`w-full px-4 md:px-8 py-5 h-20 md:h-auto flex items-center justify-between transition-all duration-300
        ${scrolled ? 'bg-white shadow-md' : 'bg-violet-900'}
        `}
      >
        {/* Left - Hamburger or X */}
        <div className="md:hidden">
          <button className={`${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Left - Logo (Desktop) */}
        <div className="hidden md:flex items-center">
          <Link href="/" className="text-3xl font-extrabold tracking-tight select-none" style={{ letterSpacing: '0.04em' }}>
            ALO <span className={scrolled ? 'text-purple-500' : 'text-purple-200'}>DOKTOR</span>
          </Link>
        </div>

        {/* Center - Logo (Mobile) */}
        <div className="md:hidden absolute inset-x-0 flex justify-center pointer-events-none">
          <Link href="/" className="pointer-events-auto text-2xl font-extrabold tracking-tight select-none" style={{ letterSpacing: '0.04em' }}>
            ALO <span className={scrolled ? 'text-purple-500' : 'text-purple-500'}>DOKTOR</span>
          </Link>
        </div>

        {/* Right - Mobile Language Switcher Only */}
        <div className="md:hidden flex items-center ml-2">
          <LanguageSwitcher />
        </div>

        {/* Desktop Nav - Centered */}
        <nav className="hidden md:flex space-x-10 text-[15px] font-medium absolute left-1/2 transform -translate-x-1/2">
          {navItems.map(item => (
            <a
              key={item.path}
              href="#"
              className={`${scrolled ? 'text-gray-900 hover:text-[#ea580c]' : 'text-white hover:text-white/80'} cursor-pointer transition-colors`}
              onClick={() => { setIsMenuOpen(false); nav.pushPath(item.path); }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <AuthButtons />
          <div className="flex items-center ml-4 relative">
            <LanguageSwitcher desktop />
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#8d6ee9] shadow-md flex flex-col overflow-hidden">
          {/* Menu Items */}
          <nav className="flex flex-col">
            {navItems.map(item => (
              <a
                key={item.path}
                href="#"
                className="text-white py-4 px-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => { setIsMenuOpen(false); nav.pushPath(item.path); }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {/* Mobile Bottom Buttons */}
          <div className="p-4 border-t border-white/10 flex flex-col gap-3">
            <AuthButtons />
          </div>
        </div>
      )}
    </header>
  );
}