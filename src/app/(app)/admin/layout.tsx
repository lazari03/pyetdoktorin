'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useSectionGuard } from '@/navigation/useSectionGuard';
import { getAdminNavDefs, getAdminProfileMenuDefs } from '@/navigation/navConfig';
import { useSessionStore } from '@/store/sessionStore';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import { UserRole } from '@/domain/entities/UserRole';
import Loader from '@/presentation/components/Loader/Loader';
import SectionShell from '@/presentation/components/SectionShell/SectionShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { logoutSessionUseCase, logoutServerUseCase } = useDI();
  const nav = useNavigationCoordinator();
  const logout = useSessionStore((s) => s.logout);
  const { redirecting } = useSectionGuard({ loading, isAuthenticated, role, pathname, allowedRole: UserRole.Admin });
  const navDefs = useMemo(() => getAdminNavDefs(), []);
  const profileMenuDefs = useMemo(() => getAdminProfileMenuDefs(), []);

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

  return (
    <SectionShell
      sectionId="admin"
      navItems={navDefs}
      profileMenuItems={profileMenuDefs}
      activePath={pathname ?? ''}
      initials={initials}
      mobileTitleKey="admin"
      mobileTitleFallback="Admin"
      onNavigate={(href) => nav.pushPath(href)}
      onMenuAction={(actionId) => {
        if (actionId === 'logout') {
          logout('manual', logoutSessionUseCase, logoutServerUseCase);
        }
      }}
    >
      {children}
    </SectionShell>
  );
}
