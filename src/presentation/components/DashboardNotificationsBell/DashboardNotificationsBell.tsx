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

  useEffect(() => {
    if (!doctorId) return;
    const unsubscribe = subscribePendingNotificationsUseCase.execute(
      doctorId,
      (data) => data as Notification,
      (items) => setNotifications(items)
    );
    return () => unsubscribe();
  }, [doctorId, subscribePendingNotificationsUseCase]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-gray-700">
        You have <span className="font-bold text-orange-500">{notifications.length}</span> notification{notifications.length !== 1 ? 's' : ''}
      </span>
      <Link href="/dashboard/notifications" className="text-orange-500 text-sm font-semibold hover:underline">
        View All
      </Link>
    </div>
  );
}
