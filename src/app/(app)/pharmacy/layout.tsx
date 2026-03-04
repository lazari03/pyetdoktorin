'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { UserRole } from '@/domain/entities/UserRole';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSectionGuard } from '@/navigation/useSectionGuard';
import { getPharmacyNavDefs, getPharmacyProfileMenuDefs } from '@/navigation/navConfig';
import { useSessionStore } from '@/store/sessionStore';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import Loader from '@/presentation/components/Loader/Loader';
import SectionShell from '@/presentation/components/SectionShell/SectionShell';
import EmailVerificationRequiredModal from '@/presentation/components/auth/EmailVerificationRequiredModal';

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user, emailVerified } = useAuth();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const nav = useNavigationCoordinator();
  const logout = useSessionStore((s) => s.logout);
  const { redirecting } = useSectionGuard({ loading, isAuthenticated, role, pathname, allowedRole: UserRole.Pharmacy });
  const navDefs = useMemo(() => getPharmacyNavDefs(), []);
  const profileMenuDefs = useMemo(() => getPharmacyProfileMenuDefs(), []);

  if (redirecting) return <RedirectingModal show />;
  if (loading) return <Loader />;
  if (!isAuthenticated || role !== UserRole.Pharmacy) return <RedirectingModal show />;

  const initials =
    (user?.name || 'P')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PH';

  const verificationRequired = isAuthenticated && !emailVerified;
  const handleLogoutClick = () => logout('manual', logoutSessionUseCase, logoutServerUseCase);

  return (
    <SectionShell
      sectionId="pharmacy"
      navItems={navDefs}
      profileMenuItems={profileMenuDefs}
      activePath={pathname ?? ''}
      initials={initials}
      mobileTitleKey="pharmacyName"
      mobileTitleFallback="Pharmacy"
      onNavigate={(href) => nav.pushPath(href)}
      onMenuAction={(actionId) => {
        if (actionId === 'logout') {
          handleLogoutClick();
        }
      }}
    >
      {verificationRequired ? null : children}
      <EmailVerificationRequiredModal isOpen={verificationRequired} onLogout={handleLogoutClick} />
    </SectionShell>
  );
}
