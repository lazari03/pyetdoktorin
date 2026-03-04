'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { useDashboardActions } from '@/presentation/hooks/useDashboardActions';
import { Card } from '@/presentation/ui/Card';

function buildNextUrl(appointmentId: string): string {
  const params = new URLSearchParams({ appointmentId });
  return `/go/join?${params.toString()}`;
}

export default function GoJoinPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams?.get('appointmentId') || '';
  const { loading, user, role } = useAuth();
  const { handleJoinCall } = useDashboardActions();

  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    if (loading) return;

    if (!appointmentId) {
      setError(t('missingAppointmentId') || 'Missing appointment id.');
      return;
    }

    if (!user) {
      const next = buildNextUrl(appointmentId);
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      startedRef.current = true;
      return;
    }

    if (!role) return;

    startedRef.current = true;
    (async () => {
      try {
        await handleJoinCall(appointmentId);
      } catch (e) {
        setError(typeof e === 'string' ? e : t('unknownError') || 'Something went wrong.');
      }
    })();
  }, [appointmentId, handleJoinCall, loading, role, router, t, user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-white">
      <Card className="card-premium w-full max-w-lg">
        <div className="card-body">
          <h1 className="card-title">{t('redirecting') || 'Redirecting…'}</h1>
          <p className="text-sm text-slate-600 mt-2">
            {t('goJoinSubtitle', { defaultValue: 'We’re taking you to your video appointment.' })}
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border border-purple-400 border-t-transparent" />
              <span className="text-sm text-slate-700">{t('loading') || 'Loading…'}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => router.replace(DASHBOARD_PATHS.root)}
              className="btn btn-outline btn-wide"
            >
              {t('backToDashboard') || 'Back to dashboard'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
