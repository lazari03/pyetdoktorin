'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getRoleNotificationsPath } from '@/navigation/roleRoutes';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  patientName: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
}

export default function DashboardNotificationsBell({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { subscribePendingNotificationsUseCase } = useDI();
  const { role } = useAuth();
  const { t } = useTranslation();
  const href = getRoleNotificationsPath(role);

  const toNotification = (data: Record<string, unknown>): Notification => {
    return {
      id: String(data.id ?? ''),
      patientName: String(data.patientName ?? ''),
      appointmentType: String(data.appointmentType ?? ''),
      preferredDate: String(data.preferredDate ?? ''),
      preferredTime: String(data.preferredTime ?? ''),
    };
  };

  useEffect(() => {
    if (!doctorId) return;
    const unsubscribe = subscribePendingNotificationsUseCase.execute(
      doctorId,
      (data) => toNotification(data),
      (items) => setNotifications(items)
    );
    return () => unsubscribe();
  }, [doctorId, subscribePendingNotificationsUseCase]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-gray-700">
        {t('youHave') || 'You have'}{' '}
        <span className="font-bold text-purple-500">{notifications.length}</span>{' '}
        {notifications.length === 1 ? (t('notificationSingular') || 'notification') : (t('notificationPlural') || 'notifications')}
      </span>
      <Link href={href} className="text-purple-500 text-sm font-semibold hover:underline">
        {t('viewAll') || 'Shiko te gjitha'}
      </Link>
    </div>
  );
}
