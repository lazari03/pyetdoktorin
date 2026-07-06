'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useInitializeAppointments } from '@/store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSessionStore } from '@/store/sessionStore';
import { UserRole } from '@/domain/entities/UserRole';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import { SectionShellSkeleton } from '@/presentation/components/Skeleton/SectionShellSkeleton';
import MissingRole from '@/presentation/components/MissingRole/MissingRole';
import { useDashboardGuard } from '@/navigation/useDashboardGuard';
import { getDashboardNavDefs, getDashboardProfileMenuDefs } from '@/navigation/navConfig';
import SectionShell from '@/presentation/components/SectionShell/SectionShell';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import EmailVerificationRequiredModal from '@/presentation/components/auth/EmailVerificationRequiredModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user, emailVerified } = useAuth();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments();
  const { redirecting } = useDashboardGuard({ loading, isAuthenticated, role, pathname });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!emailVerified) return;
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      if (role !== UserRole.Doctor && role !== UserRole.Patient) return;
      initializeAppointments(role);
      initializedRef.current = true;
    }
  }, [emailVerified, isAuthenticated, role, user, initializeAppointments]);

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
    return <SectionShellSkeleton />;
  }

  if (!isAuthenticated) {
    return <RedirectingModal show />;
  }

  if (!role) {
    return <MissingRole onLogout={handleLogoutClick} />;
  }

  const verificationRequired = isAuthenticated && !emailVerified;
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
      displayName={user?.name || undefined}
      displayEmail={user?.email || undefined}
      topbarCta={
        <Link
          href="/dashboard/new-appointment"
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 lg:px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors shrink-0 shadow-sm"
          data-analytics="dashboard.topbar.new_appointment"
        >
          <PlusIcon className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">New appointment</span>
        </Link>
      }
    >
      {verificationRequired ? null : children}
      <EmailVerificationRequiredModal isOpen={verificationRequired} onLogout={handleLogoutClick} />
    </SectionShell>
  );
}
