'use client';
import Loader from '../Loader/Loader';
import { useEffect, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { UserRole } from '@/domain/entities/UserRole';
import { hasRole } from '@/domain/rules/userRules';
import { useAuth } from '@/context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const nav = useNavigationCoordinator();
  const { role, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!role || !hasRole(role, allowedRoles)) {
      setRedirecting(true);
      nav.replacePath(fallbackPath);
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, [allowedRoles, fallbackPath, nav, role, loading]);

  // Show loader while checking or redirecting
  if (isLoading || redirecting) {
    return <div className="flex justify-center items-center min-h-screen"><Loader /></div>;
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}
