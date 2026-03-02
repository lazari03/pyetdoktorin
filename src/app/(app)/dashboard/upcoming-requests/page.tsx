'use client';

import { useCallback, useEffect, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

import type { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export default function UpcomingRequestsPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const { fetchAppointmentsUseCase } = useDI();
  const { user, role, isAuthenticated } = useAuth();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated && user && role) {
        const isDoctor = role === UserRole.Doctor;
        const allAppointments = await fetchAppointmentsUseCase.execute(user.uid, isDoctor);
        const pendingRequests = allAppointments.filter((appt: Appointment) => appt.status === 'pending');
        setRequests(pendingRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchAppointmentsUseCase, isAuthenticated, role, user]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleJoin = (requestId: string) => {
    nav.toChatRoom(requestId);
  };

  return (
    <RequestStateGate
      loading={loading}
      error={error}
      onRetry={fetchRequests}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t('loading')}
      analyticsPrefix="upcoming_requests"
    >
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
                      data-analytics="upcoming_requests.join"
                      data-analytics-id={request.id}
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
    </RequestStateGate>
  );
}
  
