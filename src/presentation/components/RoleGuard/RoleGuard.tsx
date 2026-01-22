'use client';
import Loader from '@/app/presentation/components/Loader';
import { useEffect, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const nav = useNavigationCoordinator();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    function checkUserRole() {
      try {
        const userRole = localStorage.getItem('userRole');
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          setRedirecting(true);
          // Use replace instead of push to avoid adding to history
          nav.replacePath(fallbackPath);
          return false;
        }
        return true;
      } catch {
        setRedirecting(true);
        nav.replacePath(fallbackPath);
        return false;
      }
    }

    // Check immediately, no artificial delay
    const authorized = checkUserRole();
    setIsAuthorized(authorized);
    setIsLoading(false);
  }, [allowedRoles, fallbackPath, nav]);

  // Show loader while checking or redirecting
  if (isLoading || redirecting) {
    return <div className="flex justify-center items-center min-h-screen"><Loader /></div>;
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}
