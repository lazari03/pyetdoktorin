"use client";

import { useCallback, useEffect, useState } from 'react';
import { ToastProvider, useToast } from '../components/ToastProvider';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { AdminNotificationFeed } from '@/presentation/components/admin/AdminNotificationFeed';
import type { NotificationItem } from '@/presentation/components/admin/AdminNotificationFeed';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';
import { ADMIN_PATHS } from '@/navigation/paths';
import type { NotificationBroadcastTarget } from '@/application/ports/IAdminNotificationsService';

function BroadcastComposer() {
  const { t } = useTranslation();
  const { broadcastNotificationUseCase } = useDI();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<NotificationBroadcastTarget>('all');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const result = await broadcastNotificationUseCase.execute({ title: title.trim(), body: body.trim(), target });
      showToast(t('broadcastSent', { count: result.count }) || `Sent to ${result.count} users`, 'success');
      setTitle('');
      setBody('');
    } catch {
      showToast(t('broadcastFailed') || 'Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h2 className="text-[13.5px] font-bold text-gray-900">{t('sendCustomNotification') || 'Send custom notification'}</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('notificationTitle') || 'Title'}
        maxLength={200}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('notificationBody') || 'Message'}
        maxLength={2000}
        rows={3}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as NotificationBroadcastTarget)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="all">{t('allUsers') || 'All users'}</option>
          <option value="patient">{t('patients') || 'Patients'}</option>
          <option value="doctor">{t('doctors') || 'Doctors'}</option>
          <option value="pharmacy">{t('pharmacies') || 'Pharmacies'}</option>
        </select>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="inline-flex items-center rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          data-analytics="admin.notifications.broadcast"
        >
          {sending ? t('sending') || 'Sending…' : t('send') || 'Send'}
        </button>
      </div>
    </div>
  );
}

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
          <BroadcastComposer />
          <AdminNotificationFeed items={notifications} />
        </div>
      </RequestStateGate>
    </ToastProvider>
  );
}
