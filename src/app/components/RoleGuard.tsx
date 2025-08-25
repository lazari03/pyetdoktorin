
'use client';
import Loader from './Loader';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function checkUserRole() {
      try {
        const userRole = localStorage.getItem('userRole');
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push(fallbackPath);
          return false;
        }
        return true;
  } catch {
        router.push(fallbackPath);
        return false;
      }
    }

    const timer = setTimeout(() => {
      const authorized = checkUserRole();
      setIsAuthorized(authorized);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [allowedRoles, fallbackPath, router]);


  if (isLoading) {
    // Use the centralized Loader component
    return <div className="flex justify-center items-center min-h-screen"><Loader /></div>;
  }

  return isAuthorized ? <>{children}</> : null;
}
