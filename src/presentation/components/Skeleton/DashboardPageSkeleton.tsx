'use client';

import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/presentation/ui/Skeleton';

export function DashboardPageSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 p-4 md:p-0" role="status" aria-label={t('loadingDashboard') || 'Loading dashboard'}>
      {/* KPI cards row */}
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Hero + quick actions */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <div className="lg:col-span-1 space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Appointments table + sidebar */}
      <div className="grid gap-3 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-1">
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
