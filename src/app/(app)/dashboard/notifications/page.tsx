"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import { useNotificationsLogic } from './useNotificationsLogic';
import { useNotificationReadState } from '@/presentation/hooks/useNotificationReadState';
import { useUserNotifications } from '@/presentation/hooks/useUserNotifications';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import { ListSkeleton } from '@/presentation/components/Skeleton/ListSkeleton';
import { useSearchParams } from 'next/navigation';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { getRoleLandingPath } from '@/navigation/roleRoutes';
import { APPOINTMENT_ERROR_CODES } from '@/config/errorCodes';

function NotificationsPage() {
  const { t } = useTranslation();
  const nav = useNavigationCoordinator();
  const { user } = useAuth();
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
  const { isRead, markRead, markManyRead, pruneTo } = useNotificationReadState(user?.uid);
  const { markUserNotificationReadUseCase, markAllUserNotificationsReadUseCase } = useDI();
  const { data: userNotifData, mutate: mutateUserNotifications } = useUserNotifications(user?.uid);
  const genericNotifications = useMemo(() => userNotifData?.items ?? [], [userNotifData]);
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const focusId = searchParams?.get('focus') ?? null;
  const didScrollRef = useRef<string | null>(null);

  const appointmentIds = useMemo(() => appointmentNotifications.map((a) => `appt-${a.id}`), [appointmentNotifications]);
  const prescriptionIds = useMemo(() => prescriptionNotifications.map((p) => `rx-${p.id}`), [prescriptionNotifications]);
  const allIds = useMemo(() => [...appointmentIds, ...prescriptionIds], [appointmentIds, prescriptionIds]);

  useEffect(() => {
    // Only prune when there's an actual live list to prune against. `isLoading` isn't a safe
    // guard here — it starts `false` on the very first render (before the fetch effect has even
    // run) and only flips `true` once the fetch begins, so an empty `allIds` on mount would slip
    // through an `isLoading` check and wipe every previously-read id. Skipping empty lists avoids
    // that regardless of the loading-state timing; the only cost is a few stale ids left in
    // storage if a user's notifications ever truly drop to zero, which is negligible.
    if (allIds.length === 0) return;
    pruneTo(allIds);
  }, [allIds, pruneTo]);

  const pagedAppointments = useMemo(() => {
    const start = page * pageSize;
    return appointmentNotifications.slice(start, start + pageSize);
  }, [appointmentNotifications, page]);

  const totalPages = Math.max(1, Math.ceil(appointmentNotifications.length / pageSize));
  const homeHref = useMemo(() => getRoleLandingPath(userRole), [userRole]);

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
    );
  }

  if (isLoading || !userRole) {
    return <ListSkeleton items={5} />;
  }

  if (appointmentNotifications.length === 0 && prescriptionNotifications.length === 0 && genericNotifications.length === 0) {
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

  const onAppointmentAction = (appointmentId: string, action: 'accepted' | 'rejected') => {
    markRead(`appt-${appointmentId}`);
    handleAppointmentAction(appointmentId, action);
  };

  const onDismiss = (appointmentId: string) => {
    markRead(`appt-${appointmentId}`);
    handleDismissNotification(appointmentId);
  };

  const onGenericNotificationClick = async (id: string) => {
    await markUserNotificationReadUseCase.execute(id);
    void mutateUserNotifications();
  };

  const onMarkAllGenericRead = async () => {
    await markAllUserNotificationsReadUseCase.execute();
    void mutateUserNotifications();
  };

  return (
    <div className="space-y-3">
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

      {genericNotifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13.5px] font-bold text-gray-900">{t('accountUpdates') || 'Account updates'}</p>
            <button
              type="button"
              onClick={onMarkAllGenericRead}
              className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
              data-analytics="dashboard.notifications.mark_all_read_generic"
            >
              {t('markAllRead') || 'Mark all read'}
            </button>
          </div>
          <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
            {genericNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onGenericNotificationClick(notification.id)}
                className={`px-4 py-3 flex items-start gap-2 transition cursor-default ${
                  !notification.read ? 'bg-purple-50/20' : ''
                }`}
              >
                {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-600" />}
                <div className="min-w-0">
                  <p className={`text-[12.5px] truncate ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.title}
                  </p>
                  <p className="text-[11.5px] text-gray-600">{notification.body}</p>
                  <p className="text-[10.5px] text-gray-400 mt-1">{formatDate(notification.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13.5px] font-bold text-gray-900">{t('notifications')}</p>
          <button
            type="button"
            onClick={() => markManyRead(appointmentIds)}
            className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
            data-analytics="dashboard.notifications.mark_all_read"
          >
            {t('markAllRead') || 'Mark all read'}
          </button>
        </div>
        <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
          {pagedAppointments.length === 0 && (
            <p className="text-[12.5px] text-gray-500 py-6 text-center">{t('noNotifications') || 'No notifications yet.'}</p>
          )}
          {pagedAppointments.map((appointment: typeof appointmentNotifications[number]) => {
            const status = appointment.status?.toLowerCase();
            const chip =
              status === 'accepted'
                ? { text: t('accepted'), classes: 'bg-green-50 text-green-700' }
                : status === 'rejected'
                ? { text: t('rejected'), classes: 'bg-red-50 text-red-700' }
                : { text: t('pending'), classes: 'bg-amber-50 text-amber-700' };
            const isFocused = Boolean(focusId && focusId === appointment.id);
            const unread = !isRead(`appt-${appointment.id}`);
            return (
              <div
                key={appointment.id}
                id={`notification-${appointment.id}`}
                onClick={() => markRead(`appt-${appointment.id}`)}
                className={`px-4 py-3 flex flex-col gap-2 transition cursor-default ${
                  isFocused ? 'bg-purple-50/50' : unread ? 'bg-purple-50/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-2">
                    {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-600" />}
                    <div className="min-w-0">
                      <p className={`text-[12.5px] truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {appointment.status || t('appointment')}
                      </p>
                      <p className="text-[11.5px] text-gray-500 truncate">
                        {appointment.patientName || t('patient')} • {appointment.doctorName || t('doctor')}
                      </p>
                      <p className="text-[10.5px] text-gray-400 mt-1">
                        {appointment.preferredDate} {appointment.preferredTime}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold shrink-0 ${chip.classes}`}>
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
                        onClick={(e) => { e.stopPropagation(); onAppointmentAction(appointment.id, "accepted"); }}
                        data-analytics="dashboard.notifications.accept"
                        data-analytics-id={appointment.id}
                      >
                        {t('accept')}
                      </button>
                      <button
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-[11.5px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onAppointmentAction(appointment.id, "rejected"); }}
                        data-analytics="dashboard.notifications.reject"
                        data-analytics-id={appointment.id}
                      >
                        {t('reject')}
                      </button>
                    </>
                  ) : (
                    status === 'rejected' && (
                      <Link href={DASHBOARD_PATHS.newAppointment} onClick={(e) => e.stopPropagation()}>
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
                    onClick={(e) => { e.stopPropagation(); onDismiss(appointment.id); }}
                    data-analytics="dashboard.notifications.dismiss"
                    data-analytics-id={appointment.id}
                  >
                    {t('dismissNotification')}
                  </button>
                </div>
              </div>
            );
          })}
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
          <button
            type="button"
            onClick={() => markManyRead(prescriptionIds)}
            className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
            data-analytics="dashboard.notifications.mark_all_read_prescriptions"
          >
            {t('markAllRead') || 'Mark all read'}
          </button>
        </div>
        <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
          {prescriptionNotifications.length === 0 && (
            <p className="text-[12.5px] text-gray-500 py-6 text-center">{t('noPrescriptionUpdates') || 'No prescription updates yet.'}</p>
          )}
          {prescriptionNotifications.map((item) => {
            const status = item.status?.toLowerCase();
            const chip =
              status === 'accepted'
                ? { text: t('accepted'), classes: 'bg-green-50 text-green-700' }
                : status === 'rejected'
                ? { text: t('rejected'), classes: 'bg-red-50 text-red-700' }
                : { text: t('pending'), classes: 'bg-amber-50 text-amber-700' };
            const isFocused = Boolean(focusId && focusId === item.id);
            const unread = !isRead(`rx-${item.id}`);
            return (
              <div
                key={item.id}
                id={`prescription-${item.id}`}
                onClick={() => markRead(`rx-${item.id}`)}
                className={`px-4 py-3 flex items-start justify-between gap-3 transition cursor-default ${
                  isFocused ? 'bg-purple-50/50' : unread ? 'bg-purple-50/20' : ''
                }`}
              >
                <div className="min-w-0 flex items-start gap-2">
                  {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-600" />}
                  <div className="min-w-0">
                    <p className={`text-[12.5px] truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
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
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold shrink-0 ${chip.classes}`}>
                  {chip.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
