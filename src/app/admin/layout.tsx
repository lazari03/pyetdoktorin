'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSectionGuard } from '@/navigation/useSectionGuard';
import { getAdminNavDefs } from '@/navigation/navConfig';
import { useSessionStore } from '@/store/sessionStore';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import { ROUTES } from '@/config/routes';
import { z } from '@/config/zIndex';
import { UserRole } from '@/domain/entities/UserRole';
import Loader from '@/presentation/components/Loader/Loader';

type NavItem = { name: string; href: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const nav = useNavigationCoordinator();
  const logout = useSessionStore((s) => s.logout);
  const { redirecting } = useSectionGuard({ loading, isAuthenticated, role, pathname, allowedRole: UserRole.Admin });
  const adminNav: NavItem[] = getAdminNavDefs().map((item) => ({
    name: t(item.labelKey, { defaultValue: item.fallback }),
    href: item.href,
  }));

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && e.target instanceof Node && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen]);

  useEffect(() => setProfileMenuOpen(false), [pathname]);

  if (redirecting) return <RedirectingModal show />;
  if (loading) return <Loader />;
  if (!isAuthenticated || role !== UserRole.Admin) return <RedirectingModal show />;

  const initials =
    (user?.name || 'A')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AD';

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    nav.pushPath(href);
  };

  const closeProfileMenu = () => {
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout('manual', logoutSessionUseCase, logoutServerUseCase);
    setProfileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MobileTopBar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((o) => !o)}
        initials={initials}
        onToggleProfile={() => setProfileMenuOpen((o) => !o)}
      />
      <MobileMenu open={mobileMenuOpen} items={adminNav} activePath={pathname ?? ''} onNavigate={handleNavClick} />
      <DesktopTopBar
        items={adminNav}
        activePath={pathname ?? ''}
        onNavigate={handleNavClick}
        initials={initials}
        profileMenuOpen={profileMenuOpen}
        onToggleProfile={() => setProfileMenuOpen((o) => !o)}
        onCloseProfileMenu={closeProfileMenu}
        onLogout={handleLogout}
        profileMenuRef={profileMenuRef}
        t={t}
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
    <div className={`md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4 ${z.navbar}`}>
      <button onClick={onToggleMenu} className="text-gray-800 hover:text-gray-900" aria-label="Toggle navigation menu">
        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      <span className="text-sm font-semibold text-gray-900">Admin</span>
      <button
        onClick={onToggleProfile}
        className="ml-3 h-8 w-8 rounded-full bg-purple-600 text-xs font-semibold text-white flex items-center justify-center"
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
    <div className={`md:hidden fixed inset-0 top-14 left-0 right-0 bg-white ${z.dropdown}`}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
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
  t,
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
  t: ReturnType<typeof useTranslation>['t'];
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
	            <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 text-sm ${z.dropdown}`}>
	              <Link
	                href={`${ROUTES.ADMIN}/profile`}
	                onClick={onCloseProfileMenu}
	                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
	              >
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t('profileSettings') || 'Profile settings'}</span>
	              </Link>
	              <Link
	                href={ROUTES.ADMIN}
	                onClick={onCloseProfileMenu}
	                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
	              >
                <HomeModernIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t('adminDashboard') || 'Dashboard'}</span>
	              </Link>
	              <Link
	                href={`${ROUTES.ADMIN}/notifications`}
	                onClick={onCloseProfileMenu}
	                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
	              >
                <BellIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{t('notifications') || 'Notifications'}</span>
              </Link>
              <div className="my-2 border-t border-gray-100" />
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                <span className="font-medium">{t('logOut') || 'Log out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
