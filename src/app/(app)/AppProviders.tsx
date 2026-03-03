'use client';

import '@/i18n/i18n';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { DIProvider, useDI } from '@/context/DIContext';
import { useSessionActivity } from '@/presentation/hooks/useSessionActivity';
import ToastProvider from '@/presentation/components/Toast/ToastProvider';
import AnalyticsScripts from '@/app/analytics/AnalyticsScripts';
import Analytics from '@/app/analytics/Analytics';
import ClientErrorReporter from '@/presentation/components/ClientErrorReporter/ClientErrorReporter';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  function SessionActivityHost() {
    const { logoutSessionUseCase } = useDI();
    useSessionActivity(logoutSessionUseCase);
    return null;
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Service workers are intentionally opt-in: caching HTML in Next.js apps can cause blank screens
    // after deploys (stale HTML referencing old hashed chunks). Enable only when explicitly needed.
    const enabled = process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === 'true';

    if (!enabled) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((reg) => reg.unregister().catch(() => {}));
        })
        .catch(() => {});

      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => {
            keys
              .filter((key) => key.startsWith('myapp-cache-') || key.startsWith('pyetdoktorin-cache-'))
              .forEach((key) => caches.delete(key));
          })
          .catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }, []);

  return (
    <DIProvider>
      <AuthProvider>
        <ToastProvider>
          <SessionActivityHost />
          <ClientErrorReporter />
          <Suspense fallback={null}>
            <AnalyticsScripts />
            <Analytics />
          </Suspense>
          {children}
        </ToastProvider>
      </AuthProvider>
    </DIProvider>
  );
}
