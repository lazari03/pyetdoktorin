"use client";

import { useState, useMemo } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import { useNotificationsLogic } from './useNotificationsLogic';
import { UserRole } from '@/domain/entities/UserRole';
import CenteredLoader from '@/presentation/components/CenteredLoader/CenteredLoader';

function NotificationsPage() {
  const { t } = useTranslation();
  const nav = useNavigationCoordinator();
  const {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    prescriptionNotifications,
    handleDismissNotification,
    handleAppointmentAction,
  } = useNotificationsLogic(nav);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const pagedAppointments = useMemo(() => {
    const start = page * pageSize;
    return pendingAppointments.slice(start, start + pageSize);
  }, [pendingAppointments, page]);

  const totalPages = Math.max(1, Math.ceil(pendingAppointments.length / pageSize));

  // The logic has been moved to useNotificationsLogic


  if (error) {
    nav.toDashboard();
    return null;
  }

  if (isLoading || !userRole) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <CenteredLoader />
        <span className="text-sm text-gray-600">{t('loadingNotifications', 'Loading notifications...')}</span>
      </div>
    );
  }

  if (pendingAppointments.length === 0 && prescriptionNotifications.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <p className="mb-4">{t('noNewNotifications', 'No new notifications')}</p>
        <Link href="/dashboard">
          <button className="btn btn-primary">{t('backToHome', 'Back to Home')}</button>
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
    <div className="min-h-screen py-8 px-3">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('notifications', 'Notifications')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('notificationsSubtitle') || 'Latest care updates to keep you in control.'}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-purple-700 hover:text-purple-800"
          >
            {t('backToHome')}
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">{t('notifications')}</p>
            <span className="text-xs text-gray-500">
              {t('hipaaLine') || 'HIPAA-aware | Encrypted in transit'}
            </span>
          </div>
          <div className="space-y-3">
            {pagedAppointments.map((appointment: typeof pendingAppointments[number]) => {
              const status = appointment.status?.toLowerCase();
              const chip =
                status === 'accepted'
                  ? { text: t('accepted'), classes: 'bg-green-50 text-green-700 border border-green-100' }
                  : status === 'rejected'
                  ? { text: t('rejected'), classes: 'bg-red-50 text-red-700 border border-red-100' }
                  : { text: t('pending'), classes: 'bg-amber-50 text-amber-700 border border-amber-100' };
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {appointment.status || t('appointment')}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {appointment.patientName || t('patient')} • {appointment.doctorName || t('doctor')}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {appointment.preferredDate} {appointment.preferredDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${chip.classes}`}>
                      {chip.text}
                    </span>
                  </div>

                  {appointment.notes && (
                    <p className="text-xs text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                      {appointment.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {userRole === UserRole.Doctor ? (
                      <>
                        <button
                          className="inline-flex items-center rounded-full border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition"
                          onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                        >
                          {t('accept')}
                        </button>
                        <button
                          className="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                          onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                        >
                          {t('reject')}
                        </button>
                      </>
                    ) : (
                      status === 'rejected' && (
                        <Link href="/dashboard/new-appointment">
                          <button className="inline-flex items-center rounded-full border border-purple-500 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition">
                            {t('reschedule')}
                          </button>
                        </Link>
                      )
                    )}
                    <button
                      className="ml-auto inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => handleDismissNotification(appointment.id)}
                    >
                      {t('dismissNotification')}
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingAppointments.length === 0 && (
              <p className="text-sm text-gray-500 py-4">{t('noNotifications') || 'No notifications yet.'}</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
              <button
                className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 font-semibold hover:border-purple-300 hover:text-purple-700 transition disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                {t('previous') || 'Previous'}
              </button>
              <span>
                {t('page') || 'Page'} {page + 1} / {totalPages}
              </span>
              <button
                className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 font-semibold hover:border-purple-300 hover:text-purple-700 transition disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                {t('next') || 'Next'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">
              {t('prescriptionUpdates') || 'Prescription updates'}
            </p>
            <span className="text-xs text-gray-500">
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
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.title || t('reciepeTitleDoctor') || 'Reciepe'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userRole === UserRole.Doctor
                          ? `${item.patientName || t('patient')} • ${item.pharmacyName || t('pharmacyName') || 'Pharmacy'}`
                          : `${item.doctorName || t('doctor')} • ${item.pharmacyName || t('pharmacyName') || 'Pharmacy'}`}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {formatDate(item.updatedAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${chip.classes}`}>
                      {chip.text}
                    </span>
                  </div>
                </div>
              );
            })}
            {prescriptionNotifications.length === 0 && (
              <p className="text-sm text-gray-500 py-4">{t('noPrescriptionUpdates') || 'No prescription updates yet.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
