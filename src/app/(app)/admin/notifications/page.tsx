"use client";

import { useCallback, useEffect, useState } from 'react';
import { ToastProvider } from '../components/ToastProvider';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { AdminNotificationFeed } from '@/presentation/components/admin/AdminNotificationFeed';
import type { NotificationItem } from '@/presentation/components/admin/AdminNotificationFeed';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';
import { ADMIN_PATHS } from '@/navigation/paths';

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscribePendingNotificationsUseCase } = useDI();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [retryKey, setRetryKey] = useState(0);

  const toNotification = useCallback(
    (data: Record<string, unknown>): NotificationItem => ({
      id: String(data.id ?? ''),
      title: String(data.status ?? ''),
      body: String(data.appointmentType ?? ''),
      patient: String(data.patientName ?? ''),
      clinician: String(data.doctorName ?? ''),
      timestamp: `${data.preferredDate ?? ''} ${data.preferredTime ?? ''}`.trim(),
      severity:
        String(data.status ?? '').toLowerCase() === 'accepted'
          ? 'success'
          : String(data.status ?? '').toLowerCase() === 'rejected'
            ? 'warning'
            : 'info',
      needsAction: String(data.status ?? '').toLowerCase() === 'pending',
    }),
    [],
  );

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    setNotifications([]);

    try {
      const unsubscribe = subscribePendingNotificationsUseCase.execute(
        user.uid,
        (data) => toNotification(data),
        (items) => {
          setNotifications(items);
          setLoading(false);
        },
      );
      setLoading(false);
      return () => unsubscribe();
    } catch (err) {
      setError(err);
      setLoading(false);
      return undefined;
    }
  }, [retryKey, subscribePendingNotificationsUseCase, toNotification, user?.uid]);

  return (
    <ToastProvider>
      <RequestStateGate
        loading={loading && notifications.length === 0}
        error={error}
        onRetry={() => setRetryKey((k) => k + 1)}
        homeHref={ADMIN_PATHS.root}
        loadingLabel={t('loading')}
        skeleton={<StatsPageSkeleton />}
        analyticsPrefix="admin.notifications"
      >
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-[15px] font-bold text-gray-900">{t('notifications')}</h1>
            <p className="text-[12.5px] text-gray-500">
              {t('notificationsSubtitle') ?? 'Latest care updates and actions.'}
            </p>
          </div>
          <AdminNotificationFeed items={notifications} />
        </div>
      </RequestStateGate>
    </ToastProvider>
  );
}
