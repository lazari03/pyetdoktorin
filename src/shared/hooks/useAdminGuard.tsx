'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/UserRole';

export function useAdminGuard() {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const previewMode = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === 'true' || process.env.NODE_ENV !== 'production';

  const isAdmin = useMemo(
    () => role === UserRole.Admin || role === UserRole.Doctor,
    [role],
  );

  useEffect(() => {
    if (loading) return;
    if (!previewMode) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, loading, previewMode, router]);

  return {
    loading,
    isAdmin,
    isAllowed: previewMode || (isAuthenticated && isAdmin),
  };
}
