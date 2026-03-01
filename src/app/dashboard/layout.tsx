'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Bars3Icon, XMarkIcon, BanknotesIcon, UserCircleIcon, ArrowRightOnRectangleIcon, BellIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSessionStore } from '@/store/sessionStore';
import { z } from '@/config/zIndex';
import { UserRole } from '@/domain/entities/UserRole';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import Loader from '@/presentation/components/Loader/Loader';
import MissingRole from '@/presentation/components/MissingRole/MissingRole';

type NavItem = {
  key: NavigationKey;
  name: string;
  href: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments();

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      initializeAppointments(role);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  const nav = useNavigationCoordinator();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav.toLogin(pathname ?? undefined);
    }
  }, [loading, isAuthenticated, pathname, nav]);

  useEffect(() => {
    if (!loading && role === UserRole.Pharmacy && !pathname?.startsWith('/pharmacy')) {
      nav.pushPath('/pharmacy');
    }
  }, [loading, role, pathname, nav]);

  // Centralized logout wiring
  const logout = useSessionStore((s) => s.logout);
  const handleLogoutClick = () => {
    logout('manual', logoutSessionUseCase, logoutServerUseCase);
    setProfileMenuOpen(false);
  };

  // Outside click is handled by the fixed backdrop overlay.

  // Also close profile menu when route changes
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <RedirectingModal show />;
  }

  // If a pharmacy user hits /dashboard, push them to /pharmacy and stop rendering to avoid a stuck modal
  if (role === UserRole.Pharmacy) {
    nav.pushPath('/pharmacy');
    return null;
  }

  if (!role) {
    return <MissingRole onLogout={handleLogoutClick} />;
  }

  const isAdminSection = pathname?.startsWith('/admin');
  const navItems: NavItem[] = isAdminSection
    ? [
        { key: NavigationKey.Dashboard, name: 'dashboard', href: '/admin' },
        { key: NavigationKey.Appointments, name: 'users', href: '/admin/users' },
        { key: NavigationKey.AppointmentHistory, name: 'notifications', href: '/admin/notifications' },
      ]
    : getNavigationPaths(role);

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
    <div className="min-h-screen flex flex-col">
      <MobileTopBar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => {
          setProfileMenuOpen(false);
          setMobileMenuOpen((open) => !open);
        }}
        initials={initials}
        profileMenuOpen={profileMenuOpen}
        onToggleProfile={() => {
          setMobileMenuOpen(false);
          setProfileMenuOpen((open) => !open);
        }}
        profileMenuRef={profileMenuRef}
        onCloseProfileMenu={() => setProfileMenuOpen(false)}
        onLogout={handleLogoutClick}
        onCloseMenu={() => setMobileMenuOpen(false)}
        role={role}
      />
      <MobileMenu
        open={mobileMenuOpen}
        items={navItems}
        activePath={pathname ?? ''}
        onNavigate={handleNavClick}
      />
      <DesktopTopBar
        items={navItems}
        activePath={pathname ?? ''}
        onNavigate={handleNavClick}
        initials={initials}
        profileMenuOpen={profileMenuOpen}
        onToggleProfile={() => setProfileMenuOpen((open) => !open)}
        onCloseProfileMenu={() => setProfileMenuOpen(false)}
        onLogout={handleLogoutClick}
        profileMenuRef={profileMenuRef}
        role={role}
      />
      <main className="flex-1 pt-14 md:pt-0 px-2 sm:px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

function MobileTopBar({
  mobileMenuOpen,
  onToggleMenu,
  initials,
  profileMenuOpen,
  onToggleProfile,
  profileMenuRef,
  onLogout,
  role,
  onCloseProfileMenu,
}: {
  mobileMenuOpen: boolean;
  onToggleMenu: () => void;
  initials: string;
  profileMenuOpen: boolean;
  onToggleProfile: () => void;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
  onLogout: () => void;
  onCloseMenu: () => void;
  role: string | null;
  onCloseProfileMenu: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4 ${z.navbar}`}>
      <button
        onClick={onToggleMenu}
        className="text-gray-800 hover:text-gray-900"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      <div className="flex-1 flex justify-center">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-[0.2em] text-purple-700 uppercase"
          aria-label="pyetdoktorin"
        >
          pyetdoktorin
        </Link>
      </div>
      <div className="relative z-[200]" ref={profileMenuRef}>
        <button
          onClick={onToggleProfile}
          className="h-8 w-8 rounded-full bg-gray-900 text-xs font-semibold text-white flex items-center justify-center"
          aria-label="Open profile menu"
        >
          {initials}
        </button>
        {profileMenuOpen && (
          <>
            <div
              className={`fixed inset-0 ${z.backdrop}`}
              onClick={onCloseProfileMenu}
              aria-hidden="true"
            />
            <div className={`fixed right-4 top-16 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 text-sm pointer-events-auto ${z.maximum}`}>
              <Link
                href="/dashboard/myprofile"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("profileSettings") || "Profile settings"}</span>
              </Link>
              <Link
                href="/dashboard/appointments"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("myAppointments") || "My appointments"}</span>
              </Link>
              <Link
                href="/dashboard/notifications"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <BellIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("notifications") || "Notifications"}</span>
              </Link>
              {role === UserRole.Doctor && (
                <Link
                  href="/dashboard/earnings"
                  onClick={onCloseProfileMenu}
                  className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <BanknotesIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{t("earnings") || "Earnings"}</span>
                </Link>
              )}
              <div className="my-2 border-t border-gray-100" />
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                <span className="font-medium">{t("logOut") || "Log out"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  items,
  activePath,
  onNavigate,
}: {
  open: boolean;
  items: NavItem[];
  activePath: string;
  onNavigate: (href: string) => void;
}) {
  if (!open) return null;
  return (
    <div className={`md:hidden fixed inset-0 top-14 left-0 right-0 bg-white ${z.navbar}`}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <Link
          href="/dashboard"
          className="mb-6 text-sm font-semibold tracking-[0.2em] text-purple-700 uppercase"
          aria-label="pyetdoktorin"
        >
          pyetdoktorin
        </Link>
        <nav className="flex flex-col items-center w-full max-w-sm space-y-2">
          {items.map((item) => {
            const active = activePath === item.href;
            return (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={`w-full py-4 text-center text-lg font-medium rounded-xl transition-all duration-200 ${
                  active 
                    ? 'text-purple-600 bg-purple-50 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <span className="capitalize">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function DesktopTopBar({
  items,
  activePath,
  onNavigate,
  initials,
  profileMenuOpen,
  onToggleProfile,
  onLogout,
  profileMenuRef,
  onCloseProfileMenu,
  role,
}: {
  items: NavItem[];
  activePath: string;
  onNavigate: (href: string) => void;
  initials: string;
  profileMenuOpen: boolean;
  onToggleProfile: () => void;
  onLogout: () => void;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
  onCloseProfileMenu: () => void;
  role: string | null;
}) {
  const { t } = useTranslation();
  return (
    <header className="hidden md:block">
      <div className="flex items-center justify-between px-10 py-6 relative shadow-lg bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white rounded-b-2xl border-b border-purple-400/40">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-[0.22em] uppercase text-white"
          aria-label="pyetdoktorin"
        >
          pyetdoktorin
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-white/85">
          {items.map((item) => {
            const active = activePath === item.href;
            return (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className={`px-3 py-2 rounded-full transition-colors ${
                  active
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="relative flex items-center justify-end w-24" ref={profileMenuRef}>
          <button
            onClick={onToggleProfile}
            className="h-9 w-9 rounded-full bg-white text-xs font-semibold text-purple-600 flex items-center justify-center shadow"
          >
            {initials}
          </button>
          {profileMenuOpen && (
            <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 text-sm ${z.dropdown}`}>
              {/* Profile Settings - Available to all roles */}
              <Link
                href="/dashboard/myprofile"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("profileSettings") || "Profile settings"}</span>
              </Link>
              
              {/* My Appointments - Available to all roles */}
              <Link
                href="/dashboard/appointments"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("myAppointments") || "My appointments"}</span>
              </Link>
              
              {/* Notifications - Available to all roles */}
              <Link
                href="/dashboard/notifications"
                onClick={onCloseProfileMenu}
                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <BellIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t("notifications") || "Notifications"}</span>
              </Link>
              
              {/* Earnings - Doctor only */}
              {role === UserRole.Doctor && (
                <Link
                  href="/dashboard/earnings"
                  onClick={onCloseProfileMenu}
                  className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <BanknotesIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{t("earnings") || "Earnings"}</span>
                </Link>
              )}
              
              <div className="my-2 border-t border-gray-100" />
              
              {/* Log out - Available to all roles */}
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                <span className="font-medium">{t("logOut") || "Log out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
