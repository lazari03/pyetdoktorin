
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebaseconfig';
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
    <div className="flex flex-col items-start justify-center w-full">
      <span className="text-lg font-semibold text-gray-700 mb-2">Notifications</span>
      <span className="text-3xl font-extrabold text-primary mb-1">{notifications.length}</span>
      <span className="text-base text-gray-500 mb-2">Pending notification{notifications.length !== 1 ? 's' : ''}</span>
      <Link href="/dashboard/notifications" className="text-primary text-sm font-semibold hover:underline self-end">
        View All
      </Link>
    </div>
  );
}
