'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSessionStore } from '@/store/sessionStore';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { fetchAppointmentsUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments((userId: string, isDoctor: boolean) =>
    fetchAppointmentsUseCase.execute(userId, isDoctor),
  );

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      const isDoctor = role === 'doctor';
      initializeAppointments(user.uid, isDoctor);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  const nav = useNavigationCoordinator();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav.toLogin(pathname ?? undefined);
    }
  }, [loading, isAuthenticated, pathname, nav]);

  // Centralized logout wiring
  const logout = useSessionStore((s) => s.logout);
  const handleLogoutClick = () => {
    const sessionRepo = new FirebaseSessionRepository();
    const logoutSessionUseCase = new LogoutSessionUseCase(sessionRepo);
    logout('manual', logoutSessionUseCase);
    setProfileMenuOpen(false);
  };

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        event.target instanceof Node &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Also close profile menu when route changes
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!role) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const isAdminSection = pathname?.startsWith('/admin');
  const navPaths = isAdminSection
    ? [
        { key: NavigationKey.Dashboard, name: 'dashboard', href: '/admin' },
        { key: NavigationKey.Appointments, name: 'users', href: '/admin/users' },
        { key: NavigationKey.AppointmentHistory, name: 'notifications', href: '/admin/notifications' },
        // Profile nav removed for admin
      ]
    : getNavigationPaths(role);

  const navItems = navPaths.map((item) => ({ ...item }));

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    nav.pushPath(href);
  };

  const displayName = user?.name || 'Profile';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-violet-200 via-white/80 to-white">
      {/* Mobile Top Bar with hamburger */}
  <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4">
        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="text-gray-800 hover:text-gray-900"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>

        <span className="text-sm font-semibold text-gray-900">Dashboard</span>

        {/* Right: avatar circle */}
        <button
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="ml-3 h-8 w-8 rounded-full bg-gray-900 text-xs font-semibold text-white flex items-center justify-center"
          aria-label="Open profile menu"
        >
          {initials}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
  <div className="md:hidden fixed top-14 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
          <nav className="flex flex-col py-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`px-4 py-2 text-left text-sm font-medium ${
                    active ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop top bar with centered menu and profile avatar */}
      <header className="bg-white shadow-md hidden md:block">
        <div className="flex items-center justify-between px-10 py-6 relative border-b border-gray-200 shadow-md bg-white/90 backdrop-blur">
          {/* Left spacer to help center menu visually */}
          <div className="w-24" />

          <nav className="flex items-center gap-8 text-sm font-medium text-gray-700">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`pb-1.5 border-b-2 transition-colors ${
                    active
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Right: profile avatar with dropdown below */}
          <div className="relative flex items-center justify-end w-24" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="h-9 w-9 rounded-full bg-gray-900 text-xs font-semibold text-white flex items-center justify-center"
            >
              {initials}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-lg border border-gray-100 py-1 text-sm">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    nav.pushPath('/dashboard/myprofile');
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-xl"
                >
                  Profile settings
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-xl"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14 md:pt-0 px-2 sm:px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-8 bg-gradient-to-t from-violet-200 to-white">{children}</main>
    </div>
  );
}
