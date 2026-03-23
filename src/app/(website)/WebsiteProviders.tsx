'use client';

import { Suspense } from 'react';
import ToastProvider from '@/presentation/components/Toast/ToastProvider';
import AnalyticsScripts from '@/app/analytics/AnalyticsScripts';
import ClientErrorReporter from '@/presentation/components/ClientErrorReporter/ClientErrorReporter';

export default function WebsiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ClientErrorReporter />
      <Suspense fallback={null}>
        <AnalyticsScripts />
      </Suspense>
      {children}
    </ToastProvider>
  );
}
