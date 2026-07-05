'use client';

import { useCallback, useEffect, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

import type { Appointment } from '@/domain/entities/Appointment';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { listAppointments } from '@/network/appointments';

export default function UpcomingRequestsPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated && user) {
        const allAppointments = await listAppointments();
        const pendingRequests = allAppointments.items.filter((appt: Appointment) => appt.status === 'pending');
        setRequests(pendingRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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
      <div>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-[15px] font-bold text-gray-900">{t('upcomingRequests')}</h1>
            <p className="text-[12.5px] text-gray-500">
              {t('manageUpcomingAppointments') ?? 'Manage your upcoming appointment requests.'}
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-500">
              {t('noUpcomingRequests')}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
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
  
