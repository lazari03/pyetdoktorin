'use client';

import { useEffect, useMemo } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

import { useAppointmentStore } from '@/store/appointmentStore';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { TableSkeleton } from '@/presentation/components/Skeleton/TableSkeleton';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export default function UpcomingRequestsPage() {
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const { user, role, isAuthenticated } = useAuth();
  // Shared with dashboard/page.tsx, useAppointmentsViewModel, and
  // useNotificationsLogic, so this list is fetched once instead of
  // independently per consumer.
  const { appointments, loading, error, fetchAppointments } = useAppointmentStore();

  useEffect(() => {
    if (isAuthenticated && user && role) {
      fetchAppointments(role);
    }
  }, [isAuthenticated, user, role, fetchAppointments]);

  const requests = useMemo(
    () => (isAuthenticated && user ? appointments.filter((appt) => appt.status === 'pending') : []),
    [appointments, isAuthenticated, user],
  );

  const fetchRequests = () => {
    if (role) fetchAppointments(role, true);
  };

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
      skeleton={<TableSkeleton />}
      analyticsPrefix="upcoming_requests"
    >
      <div>
        <div className="space-y-3">
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
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 text-center text-[12.5px] text-gray-500">
              {t('noUpcomingRequests')}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 space-y-3">
                  <div>
                    <h2 className="text-[12.5px] font-semibold text-gray-900">
                      {t('appointmentWith', { doctorId: request.doctorId })}
                    </h2>
                    <p className="text-[11.5px] text-gray-500">
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
  
