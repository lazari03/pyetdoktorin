'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../config/firebaseconfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

interface Notification {
  id: string;
  message: string;
  appointmentId: string;
  status: string;
}

export default function DashboardNotifications({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('doctorId', '==', doctorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, [doctorId]);

  const handleAccept = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { status: 'accepted' });
    alert('Appointment accepted!');
  };

  const handleReject = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { status: 'rejected' });
    alert('Appointment rejected!');
  };

  return (
    <div className="notifications">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.map((notification) => (
        <div key={notification.id} className="notification-item flex justify-between items-center p-3 border-b">
          <p>{notification.message}</p>
          <div className="actions flex gap-2">
            <button className="btn btn-success" onClick={() => handleAccept(notification.id)}>
              ✓
            </button>
            <button className="btn btn-error" onClick={() => handleReject(notification.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
