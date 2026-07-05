"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import { useNotificationsLogic } from './useNotificationsLogic';
import { UserRole } from '@/domain/entities/UserRole';
import Loader from '@/presentation/components/Loader/Loader';
import { useSearchParams } from 'next/navigation';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { getRoleLandingPath } from '@/navigation/roleRoutes';
import { APPOINTMENT_ERROR_CODES } from '@/config/errorCodes';

function NotificationsPage() {
  const { t } = useTranslation();
  const nav = useNavigationCoordinator();
  const searchParams = useSearchParams();
  const {
    isLoading,
    error,
    userRole,
    appointmentNotifications,
    prescriptionNotifications,
    handleDismissNotification,
    handleAppointmentAction,
    retry,
  } = useNotificationsLogic(nav);
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const focusId = searchParams?.get('focus') ?? null;
  const didScrollRef = useRef<string | null>(null);

  const pagedAppointments = useMemo(() => {
    const start = page * pageSize;
    return appointmentNotifications.slice(start, start + pageSize);
  }, [appointmentNotifications, page]);

  const totalPages = Math.max(1, Math.ceil(appointmentNotifications.length / pageSize));
  const homeHref = useMemo(() => getRoleLandingPath(userRole), [userRole]);

  // The logic has been moved to useNotificationsLogic

  useEffect(() => {
    if (!focusId) return;
    if (isLoading || !userRole) return;
    const index = appointmentNotifications.findIndex((appt) => appt.id === focusId);
    if (index < 0) return;
    const desiredPage = Math.floor(index / pageSize);
    if (desiredPage !== page) {
      setPage(desiredPage);
    }
  }, [focusId, isLoading, userRole, appointmentNotifications, page, pageSize]);

  useEffect(() => {
    if (!focusId) return;
    if (isLoading || !userRole) return;

    const marker = `${focusId}:${page}`;
    if (didScrollRef.current === marker) return;

    // Wait for the focused item to render (especially after paging).
    const appointmentId = `notification-${focusId}`;
    const prescriptionId = `prescription-${focusId}`;
    const el = typeof document === 'undefined' ? null : (document.getElementById(appointmentId) || document.getElementById(prescriptionId));
    if (!el) return;

    didScrollRef.current = marker;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focusId, isLoading, userRole, page, pagedAppointments]);


  if (error === APPOINTMENT_ERROR_CODES.Unauthorized) {
    nav.toLogin();
    return null;
  }

  if (error) {
    return (
      <div className="py-4 sm:py-6 px-3">
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-[15px] font-bold text-gray-900">
            {t('notifications', 'Notifications')}
          </h1>
          <p className="text-[12.5px] text-gray-500">
            {t('notificationsLoadFailed', 'We could not load your notifications right now.')}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              onClick={retry}
              data-analytics="dashboard.notifications.retry"
            >
              {t('retry', 'Retry')}
            </button>
            <Link
              href={homeHref}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              data-analytics="dashboard.notifications.back_home"
            >
              {t('backToHome', 'Back to Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !userRole) {
    return <Loader label={t('loadingNotifications', 'Loading notifications...')} />;
  }

  if (appointmentNotifications.length === 0 && prescriptionNotifications.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16 text-gray-500">
        <p className="mb-4 text-[12.5px]">{t('noNewNotifications', 'No new notifications')}</p>
        <Link
          href={homeHref}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          {t('backToHome', 'Back to Home')}
        </Link>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="py-4 sm:py-6 px-3">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-[15px] font-bold text-gray-900">
              {t('notifications', 'Notifications')}
            </h1>
            <p className="text-[12.5px] text-gray-500">
              {t('notificationsSubtitle') || 'Latest care updates to keep you in control.'}
            </p>
          </div>
        <Link
          href={homeHref}
          className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
          data-analytics="dashboard.notifications.back_home"
        >
          {t('backToHome')}
        </Link>
      </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13.5px] font-bold text-gray-900">{t('notifications')}</p>
            <span className="text-[11px] text-gray-400">
              {t('hipaaLine') || 'HIPAA-aware | Encrypted in transit'}
            </span>
          </div>
          <div className="space-y-3">
            {pagedAppointments.map((appointment: typeof appointmentNotifications[number]) => {
              const status = appointment.status?.toLowerCase();
              const chip =
                status === 'accepted'
                  ? { text: t('accepted'), classes: 'bg-green-50 text-green-700 border border-green-100' }
                  : status === 'rejected'
                  ? { text: t('rejected'), classes: 'bg-red-50 text-red-700 border border-red-100' }
                  : { text: t('pending'), classes: 'bg-amber-50 text-amber-700 border border-amber-100' };
              const isFocused = Boolean(focusId && focusId === appointment.id);
              return (
                <div
                  key={appointment.id}
                  id={`notification-${appointment.id}`}
                  className={`bg-white rounded-xl border shadow-sm px-4 py-3 flex flex-col gap-2 transition ${
                    isFocused ? 'border-purple-200 ring-2 ring-purple-300 bg-purple-50/40' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-gray-900 truncate">
                        {appointment.status || t('appointment')}
                      </p>
                      <p className="text-[11.5px] text-gray-500 truncate">
                        {appointment.patientName || t('patient')} • {appointment.doctorName || t('doctor')}
                      </p>
                      <p className="text-[10.5px] text-gray-400 mt-1">
                        {appointment.preferredDate} {appointment.preferredTime}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${chip.classes}`}>
                      {chip.text}
                    </span>
                  </div>

                  {appointment.notes && (
                    <p className="text-[11.5px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      {appointment.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {userRole === UserRole.Doctor ? (
                      <>
                        <button
                          className="inline-flex items-center rounded-lg border border-green-200 px-3 py-1.5 text-[11.5px] font-semibold text-green-700 hover:bg-green-50 transition-colors"
                          onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                          data-analytics="dashboard.notifications.accept"
                          data-analytics-id={appointment.id}
                        >
                          {t('accept')}
                        </button>
                        <button
                          className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-[11.5px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                          data-analytics="dashboard.notifications.reject"
                          data-analytics-id={appointment.id}
                        >
                          {t('reject')}
                        </button>
                      </>
                    ) : (
                      status === 'rejected' && (
                        <Link href={DASHBOARD_PATHS.newAppointment}>
                          <button
                            className="inline-flex items-center rounded-lg border border-purple-400 px-3 py-1.5 text-[11.5px] font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition-colors"
                            data-analytics="dashboard.notifications.reschedule"
                            data-analytics-id={appointment.id}
                          >
                            {t('reschedule')}
                          </button>
                        </Link>
                      )
                    )}
                    <button
                      className="ml-auto inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-[11.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                      onClick={() => handleDismissNotification(appointment.id)}
                      data-analytics="dashboard.notifications.dismiss"
                      data-analytics-id={appointment.id}
                    >
                      {t('dismissNotification')}
                    </button>
                  </div>
                </div>
              );
            })}
            {appointmentNotifications.length === 0 && (
              <p className="text-[12.5px] text-gray-500 py-4">{t('noNotifications') || 'No notifications yet.'}</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-[11.5px] text-gray-500 pt-3 border-t border-gray-100">
              <button
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 font-semibold hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                data-analytics="dashboard.notifications.pagination_prev"
              >
                {t('previous') || 'Previous'}
              </button>
              <span>
                {t('page') || 'Page'} {page + 1} / {totalPages}
              </span>
              <button
                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 font-semibold hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                data-analytics="dashboard.notifications.pagination_next"
              >
                {t('next') || 'Next'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13.5px] font-bold text-gray-900">
              {t('prescriptionUpdates') || 'Prescription updates'}
            </p>
            <span className="text-[11px] text-gray-400">
              {t('pharmacyNotificationsSubtitle') || 'Orders and prescription updates'}
            </span>
          </div>
          <div className="space-y-3">
            {prescriptionNotifications.map((item) => {
              const status = item.status?.toLowerCase();
              const chip =
                status === 'accepted'
                  ? { text: t('accepted'), classes: 'bg-green-50 text-green-700 border border-green-100' }
                  : status === 'rejected'
                  ? { text: t('rejected'), classes: 'bg-red-50 text-red-700 border border-red-100' }
                  : { text: t('pending'), classes: 'bg-amber-50 text-amber-700 border border-amber-100' };
              const isFocused = Boolean(focusId && focusId === item.id);
              return (
                <div
                  key={item.id}
                  id={`prescription-${item.id}`}
                  className={`bg-white rounded-xl border shadow-sm px-4 py-3 flex flex-col gap-2 transition ${
                    isFocused ? 'border-purple-200 ring-2 ring-purple-300 bg-purple-50/40' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-gray-900 truncate">
                        {item.title || t('reciepeTitleDoctor') || 'Reciepe'}
                      </p>
                      <p className="text-[11.5px] text-gray-500 truncate">
                        {userRole === UserRole.Doctor
                          ? `${item.patientName || t('patient')} • ${item.pharmacyName || t('pharmacyName') || 'Pharmacy'}`
                          : `${item.doctorName || t('doctor')} • ${item.pharmacyName || t('pharmacyName') || 'Pharmacy'}`}
                      </p>
                      {status === 'pending' ? (
                        <p className="text-[11px] text-purple-700 mt-1">
                          {t('newPrescriptionNotification') || 'A new prescription was issued to your account.'}
                        </p>
                      ) : null}
                      <p className="text-[10.5px] text-gray-400 mt-1">
                        {formatDate(item.updatedAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${chip.classes}`}>
                      {chip.text}
                    </span>
                  </div>
                </div>
              );
            })}
            {prescriptionNotifications.length === 0 && (
              <p className="text-[12.5px] text-gray-500 py-4">{t('noPrescriptionUpdates') || 'No prescription updates yet.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
