'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from '@/presentation/components/navigation/AdminSidebar';
import { useAdminGuard } from '@/shared/hooks/useAdminGuard';
import CenteredLoader from '@/app/components/CenteredLoader';

export function AdminShell({ children }: { children: ReactNode }) {
  const { loading, isAllowed } = useAdminGuard();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CenteredLoader />
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className="flex min-h-screen bg-base-100 text-base-content">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
