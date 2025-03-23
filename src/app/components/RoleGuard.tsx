'use client';

import { useEffect, useState } from 'react';
// Remove the router import if not using it
// import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard'
}: RoleGuardProps) {
  // Remove the router if not using it
  // const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to check user role from localStorage
    function checkUserRole() {
      try {
        // First check if we're in a browser environment
        if (typeof window === 'undefined') {
          console.log('Server-side rendering, skipping role check');
          return false;
        }

        // Logging for debugging
        console.log('RoleGuard: Checking user role');
        console.log('RoleGuard: Allowed roles', allowedRoles);
        
        const userRole = localStorage.getItem('userRole');
        console.log('RoleGuard: User role from localStorage:', userRole);
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log(`RoleGuard: Access denied - ${userRole} not in allowed roles:`, allowedRoles);
          
          // Use hard navigation to ensure full page reload
          console.log('RoleGuard: Redirecting to', fallbackPath);
          window.location.href = fallbackPath;
          return false;
        }
        
        console.log('RoleGuard: Access granted');
        return true;
      } catch (error) {
        console.error('RoleGuard: Error checking user role:', error);
        window.location.href = fallbackPath;
        return false;
      }
    }

    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      const authorized = checkUserRole();
      setIsAuthorized(authorized);
      setIsLoading(false);
    }, 300); // Increased delay to ensure localStorage is available

    return () => clearTimeout(timer);
  }, [allowedRoles, fallbackPath]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="loading loading-spinner loading-lg"></div>
      <span className="ml-2">Checking authorization...</span>
    </div>;
  }

  // Only render children if the user is authorized
  return isAuthorized ? <>{children}</> : null;
}
