'use client';

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

export default function DashboardNotifications({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!doctorId) {
      console.warn("doctorId is undefined. Skipping notifications query.");
      return;
    }

    console.log("Fetching notifications for doctorId:", doctorId);

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending') // Fetch only pending appointments
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      console.log("Fetched notifications:", fetchedNotifications);
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, [doctorId]);

  return (
    <div className="notifications">
      <h2 className="text-xl font-bold mb-4">New Appointment Requests</h2>
      {notifications.length === 0 ? (
        <p>No new appointment requests.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="notification-item p-3 border-b">
            <p>
              <strong>{notification.patientName}</strong> requested a{' '}
              <strong>{notification.appointmentType}</strong> on{' '}
              <strong>{notification.preferredDate}</strong> at{' '}
              <strong>{notification.preferredTime}</strong>.
            </p>
          </div>
        ))
      )}
    </div>
  );
}
