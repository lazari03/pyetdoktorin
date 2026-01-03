'use client';

import { useState, useEffect } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

import type { Appointment } from '@/domain/entities/Appointment';

export default function UpcomingRequestsPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const { fetchAppointmentsUseCase } = useDI();
  const { user, role, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user && role) {
          const isDoctor = role === 'doctor';
          const allAppointments = await fetchAppointmentsUseCase.execute(user.uid, isDoctor);
          // Filter for pending requests (assuming status field exists)
          const pendingRequests = allAppointments.filter((appt: Appointment) => appt.status === 'pending');
          setRequests(pendingRequests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert(t('unknownError'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [t, isAuthenticated, user, role, fetchAppointmentsUseCase]);

  const handleJoin = (requestId: string) => {
    nav.toChatRoom(requestId);
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('upcomingRequests')}</h1>
      {requests.length === 0 ? (
        <p>{t('noUpcomingRequests')}</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">{t('appointmentWith', { doctorId: request.doctorId })}</h2>
                <p>{t('appointmentType', { appointmentType: request.appointmentType })}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleJoin(request.id)}
                >
                  {t('join')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
  