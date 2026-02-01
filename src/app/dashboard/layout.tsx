'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSessionStore } from '@/store/sessionStore';

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
  const { fetchAppointmentsUseCase, logoutSessionUseCase, logoutServerUseCase } = useDI();
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
    logout('manual', logoutSessionUseCase, logoutServerUseCase);
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
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
        initials={initials}
        onToggleProfile={() => setProfileMenuOpen((open) => !open)}
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
        onProfileSettings={() => {
          setProfileMenuOpen(false);
          nav.pushPath('/dashboard/myprofile');
        }}
        onLogout={handleLogoutClick}
        profileMenuRef={profileMenuRef}
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
  onToggleProfile,
}: {
  mobileMenuOpen: boolean;
  onToggleMenu: () => void;
  initials: string;
  onToggleProfile: () => void;
}) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4">
      <button
        onClick={onToggleMenu}
        className="text-gray-800 hover:text-gray-900"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      <span className="text-sm font-semibold text-gray-900">Dashboard</span>
      <button
        onClick={onToggleProfile}
        className="ml-3 h-8 w-8 rounded-full bg-gray-900 text-xs font-semibold text-white flex items-center justify-center"
        aria-label="Open profile menu"
      >
        {initials}
      </button>
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
    <div className="md:hidden fixed top-14 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
      <nav className="flex flex-col py-2">
        {items.map((item) => {
          const active = activePath === item.href;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`px-4 py-2 text-left text-sm font-medium ${
                active ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>
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
  onProfileSettings,
  onLogout,
  profileMenuRef,
}: {
  items: NavItem[];
  activePath: string;
  onNavigate: (href: string) => void;
  initials: string;
  profileMenuOpen: boolean;
  onToggleProfile: () => void;
  onProfileSettings: () => void;
  onLogout: () => void;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <header className="hidden md:block">
      <div className="flex items-center justify-between px-10 py-6 relative shadow-lg bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 text-white rounded-b-2xl border-b border-purple-400/40">
        <div className="w-24" />
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
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white shadow-lg border border-gray-100 py-1 text-sm">
              <button
                onClick={onProfileSettings}
                className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-xl"
              >
                Profile settings
              </button>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-xl"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
