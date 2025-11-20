'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/UserRole';

export function useAdminGuard() {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();

  const isAdmin = useMemo(
    () => role === UserRole.Admin || role === UserRole.Doctor,
    [role],
  );

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  return {
    loading,
    isAdmin,
    isAllowed: isAuthenticated && isAdmin,
  };
}
