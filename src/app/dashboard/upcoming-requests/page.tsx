'use client';

import { useState, useEffect } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

import type { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import CenteredLoader from '@/presentation/components/CenteredLoader/CenteredLoader';

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
          const isDoctor = role === UserRole.Doctor;
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <CenteredLoader />
        <span className="text-sm text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">{t('upcomingRequests')}</h1>
          <p className="text-sm text-gray-600">
            {t('manageUpcomingAppointments') ?? 'Manage your upcoming appointment requests.'}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl bg-white border border-purple-50 shadow p-6 text-center text-sm text-gray-600">
            {t('noUpcomingRequests')}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="rounded-3xl bg-white border border-purple-50 shadow p-5 space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {t('appointmentWith', { doctorId: request.doctorId })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t('appointmentTypeLabel', { appointmentType: request.appointmentType })}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
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
    </div>
  );
}
  
