"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebaseconfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Notification {
  id: string;
  patientName: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
}

export default function DashboardNotificationsBell({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!doctorId) return;
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Notification[];
      setNotifications(fetched);
    });
    return () => unsubscribe();
  }, [doctorId]);

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
