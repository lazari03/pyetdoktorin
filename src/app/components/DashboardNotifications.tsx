'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

  useEffect(() => {
    if (!doctorId) {
      return;
    }

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
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, [doctorId]);

  return (
    <div className="notifications">
      <h2 className="text-xl font-bold mb-4">{t('newAppointmentRequests')}</h2>
      {notifications.length === 0 ? (
        <p>{t('noNewAppointmentRequests')}</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="notification-item p-3 border-b">
            <p>
              {t('appointmentRequestText', {
                patientName: notification.patientName,
                appointmentType: notification.appointmentType,
                preferredDate: notification.preferredDate,
                preferredTime: notification.preferredTime,
              })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
