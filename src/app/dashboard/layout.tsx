'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSessionStore } from '@/store/sessionStore';
import { ROUTES } from '@/config/routes';
import { UserRole } from '@/domain/entities/UserRole';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import Loader from '@/presentation/components/Loader/Loader';
import MissingRole from '@/presentation/components/MissingRole/MissingRole';
import { useDashboardGuard } from '@/navigation/useDashboardGuard';
import { getDashboardNavDefs, getDashboardProfileMenuDefs } from '@/navigation/navConfig';
import SectionShell from '@/presentation/components/SectionShell/SectionShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments();
  const { redirecting } = useDashboardGuard({ loading, isAuthenticated, role, pathname });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      if (role !== UserRole.Doctor && role !== UserRole.Patient) return;
      initializeAppointments(role);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  const nav = useNavigationCoordinator();

  // Centralized logout wiring
  const logout = useSessionStore((s) => s.logout);
  const handleLogoutClick = () => {
    logout('manual', logoutSessionUseCase, logoutServerUseCase);
  };

  if (redirecting) {
    return <RedirectingModal show />;
  }

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <RedirectingModal show />;
  }

  if (!role) {
    return <MissingRole onLogout={handleLogoutClick} />;
  }

  const navDefs = getDashboardNavDefs(role);
  const profileMenuDefs = getDashboardProfileMenuDefs(role);

  const displayName = user?.name || 'Profile';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SectionShell
      sectionId="dashboard"
      navItems={navDefs}
      profileMenuItems={profileMenuDefs}
      activePath={pathname ?? ''}
      initials={initials}
      onNavigate={(href) => nav.pushPath(href)}
      onMenuAction={(actionId) => {
        if (actionId === 'logout') handleLogoutClick();
      }}
      mobileCenter={
        <Link
          href={ROUTES.DASHBOARD}
          className="text-sm font-semibold tracking-[0.2em] text-purple-700 uppercase"
          aria-label="pyetdoktorin"
          data-analytics="dashboard.brand.home"
        >
          pyetdoktorin
        </Link>
      }
      desktopLeft={
        <Link
          href={ROUTES.DASHBOARD}
          className="text-sm font-semibold tracking-[0.22em] uppercase text-white"
          aria-label="pyetdoktorin"
          data-analytics="dashboard.brand.home"
        >
          pyetdoktorin
        </Link>
      }
    >
      {children}
    </SectionShell>
  );
}
