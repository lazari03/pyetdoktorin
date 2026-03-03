'use client';

import '@/i18n/i18n';
import { Suspense } from 'react';
import ToastProvider from '@/presentation/components/Toast/ToastProvider';
import CookieConsentBanner from '@/presentation/components/CookieConsentBanner/CookieConsentBanner';
import AnalyticsScripts from '@/app/analytics/AnalyticsScripts';
import ClientErrorReporter from '@/presentation/components/ClientErrorReporter/ClientErrorReporter';

export default function WebsiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ClientErrorReporter />
      <CookieConsentBanner />
      <Suspense fallback={null}>
        <AnalyticsScripts />
      </Suspense>
      {children}
    </ToastProvider>
  );
}
