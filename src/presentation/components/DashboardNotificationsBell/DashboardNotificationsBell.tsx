'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDI } from '@/context/DIContext';

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
        You have <span className="font-bold text-purple-500">{notifications.length}</span> notification{notifications.length !== 1 ? 's' : ''}
      </span>
      <Link href="/dashboard/notifications" className="text-purple-500 text-sm font-semibold hover:underline">
        View All
      </Link>
    </div>
  );
}
