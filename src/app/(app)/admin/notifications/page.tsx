"use client";

import { useEffect, useState } from 'react';
import { ToastProvider } from '../components/ToastProvider';
import DashboardShell from '@/app/components/DashboardShell';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { AdminNotificationFeed } from '@/presentation/components/admin/AdminNotificationFeed';
import type { NotificationItem } from '@/presentation/components/admin/AdminNotificationFeed';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscribePendingNotificationsUseCase } = useDI();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const toNotification = (data: Record<string, unknown>): NotificationItem => ({
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
    });

    const unsubscribe = subscribePendingNotificationsUseCase.execute(
      user.uid,
      (data) => toNotification(data),
      (items) => setNotifications(items)
    );
    return () => unsubscribe();
  }, [user, subscribePendingNotificationsUseCase]);

  return (
    <ToastProvider>
      <DashboardShell>
        <div className="p-4 md:p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{t('notifications')}</h1>
            <p className="text-sm text-gray-600">
              {t('notificationsSubtitle') ?? 'Latest care updates and actions.'}
            </p>
          </div>
          <AdminNotificationFeed items={notifications} />
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
