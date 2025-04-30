'use client';

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
        const userRole = localStorage.getItem('userRole'); // Assuming role is stored in localStorage
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push(fallbackPath);
          return false;
        }
        return true;
      } catch (error) {
        console.error('RoleGuard: Error checking user role:', error);
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Checking authorization...</span>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
