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
    { path: '/individuals', label: t('individuals') },
    { path: '/doctors', label: t('doctors') },
    { path: '/clinicians', label: t('clinicians') },
    { path: '/contact', label: t('contact') || 'Contact' },
  ].filter(item => item.label);

  const AuthButtons = () => !loading && (
    (isAuthenticated && hasAuthCookie)
      ? <button className="bg-purple-700 text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-500 transition-colors cursor-pointer" onClick={() => { setIsMenuOpen(false); nav.toDashboard(); }}>{t('goToDashboard') || 'Go to Dashboard'}</button>
      : <>
          <button className={`${scrolled ? 'text-gray-900' : 'text-white'} hover:underline font-medium cursor-pointer transition-colors`} onClick={() => { setIsMenuOpen(false); nav.toLogin(); }}>{t('signIn')}</button>
          <button className="bg-purple-500 text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-200 transition-colors cursor-pointer" onClick={() => { setIsMenuOpen(false); nav.toRegister(); }}>{t('registerNow')}</button>
        </>
  );

  return (
    <header className={`w-full ${scrolled ? 'fixed top-0 left-0 z-50' : 'static'} top-0 left-0`}>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-200 ease-in-out animate-fade-in" style={{ pointerEvents: 'auto' }} onClick={() => setIsMenuOpen(false)} />
      )}
      <div className={`w-full px-4 md:px-8 py-5 h-20 md:h-auto flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-violet-900'}`}>
        <div className="md:hidden">
          <button className={`${scrolled ? 'text-gray-900' : 'text-white'} transition-colors`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
          </button>
        </div>
        <div className="absolute left-0 right-0 flex justify-center md:justify-start md:static pointer-events-none md:pointer-events-auto">
          <Link href="/" className="pointer-events-auto select-none font-extrabold tracking-tight text-2xl md:text-3xl md:ml-0 ml-0" style={{ letterSpacing: '0.04em' }}>
            ALO <span className={scrolled ? 'text-purple-500' : 'text-purple-200 md:text-purple-500'}>DOKTOR</span>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-10 text-[15px] font-medium absolute left-1/2 transform -translate-x-1/2">
          {navItems.map(item => (
            <a key={item.path} href="#" className={`${scrolled ? 'text-gray-900 hover:text-[#ea580c]' : 'text-white hover:text-white/80'} cursor-pointer transition-colors`} onClick={() => { setIsMenuOpen(false); nav.pushPath(item.path); }}>{item.label}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <AuthButtons />
        </div>
      </div>
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#8d6ee9] shadow-md flex flex-col overflow-hidden">
          <nav className="flex flex-col">
            {navItems.map(item => (
              <a key={item.path} href="#" className="text-white py-4 px-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => { setIsMenuOpen(false); nav.pushPath(item.path); }}>{item.label}</a>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 flex flex-col gap-3">
            <AuthButtons />
          </div>
        </div>
      )}
    </header>
  );
}
