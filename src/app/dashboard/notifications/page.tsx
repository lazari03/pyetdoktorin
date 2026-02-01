"use client";

import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import styles from "./notifications.module.css";
import { useNotificationsLogic } from './useNotificationsLogic';


function NotificationsPage() {
  const { t } = useTranslation();
  const nav = useNavigationCoordinator();
  const {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    handleDismissNotification,
    handleAppointmentAction,
  } = useNotificationsLogic(nav);

  // The logic has been moved to useNotificationsLogic


  if (error) {
    nav.toDashboard();
    return null;
  }

  if (isLoading || !userRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">{t('loadingNotifications', 'Loading notifications...')}</span>
      </div>
    );
  }

  if (pendingAppointments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <p className="mb-4">{t('noNewNotifications', 'No new notifications')}</p>
        <Link href="/dashboard">
          <button className="btn btn-primary">{t('backToHome', 'Back to Home')}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8 px-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">{t('notifications', 'Notifications')}</h1>
      {/* Desktop Table */}
      <div className={`overflow-x-auto max-w-6xl mx-auto ${styles['animate-pop-up']} ${styles['widget-elevated']} hidden md:block`}>
        <table className="w-full text-base font-medium bg-transparent">
          <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
            <tr>
              <th className="px-3 py-3 text-left text-gray-700 font-semibold">{t('patientName', 'Patient Name')}</th>
              <th className="px-3 py-3 text-left text-gray-700 font-semibold">{t('doctor', 'Doctor')}</th>
              <th className="px-3 py-3 text-left text-gray-700 font-semibold">{t('date', 'Date')}</th>
              <th className="px-3 py-3 text-left text-gray-700 font-semibold">{t('notes', 'Notes')}</th>
              <th className="px-3 py-3 text-center text-gray-700 font-semibold">{t('status', 'Status')}</th>
              <th className="px-3 py-3 text-center text-gray-700 font-semibold">{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.map((appointment: typeof pendingAppointments[number], idx: number) => (
              <tr key={appointment.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-3 align-middle text-gray-800 whitespace-nowrap rounded-l-xl">{appointment.patientName || t('unknown', 'Unknown')}</td>
                <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.doctorName || t('unknown', 'Unknown')}</td>
                <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.preferredDate || '-'}</td>
                <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.notes || '-'}</td>
                <td className="px-3 py-3 align-middle text-center">
                  {appointment.status === 'accepted' && <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">{t('accepted', 'Accepted')}</span>}
                  {appointment.status === 'rejected' && <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">{t('rejected', 'Rejected')}</span>}
                  {appointment.status === 'pending' && <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">{t('pending', 'Pending')}</span>}
                </td>
                <td className="px-3 py-3 align-middle text-center rounded-r-xl">
                  <div className="flex flex-row gap-2 justify-center items-center">
                    {userRole === 'doctor' ? (
                      <>
                        <button
                          className="transition-all duration-150 ease-in-out bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 w-24"
                          onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                        >
                          {t('accept', 'Accept')}
                        </button>
                        <button
                          className="transition-all duration-150 ease-in-out bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 w-24"
                          onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                        >
                          {t('reject', 'Reject')}
                        </button>
                      </>
                    ) : (
                      appointment.status === 'rejected' && (
                        <Link href="/dashboard/new-appointment">
                          <button className="transition-all duration-150 ease-in-out bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-28">
                            {t('reschedule', 'Reschedule')}
                          </button>
                        </Link>
                      )
                    )}
                    {/* Dismiss Button */}
                    <button
                      className="transition-all duration-150 ease-in-out bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                      onClick={() => handleDismissNotification(appointment.id)}
                      aria-label={t('dismissNotification', 'Dismiss notification')}
                    >
                      {t('dismiss', 'Dismiss')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card List */}
      <div className={`block md:hidden mt-6 space-y-6 ${styles['animate-pop-up']} ${styles['widget-elevated']}`}>
  {pendingAppointments.map((appointment: typeof pendingAppointments[number]) => (
          <div key={appointment.id} className="rounded-xl shadow bg-white p-4 flex flex-col gap-3 mb-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">{appointment.preferredDate}</span>
              <span
                className={
                  appointment.status === 'accepted'
                    ? 'text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full'
                    : appointment.status === 'rejected'
                    ? 'text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full'
                    : 'text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full'
                }
              >
                {appointment.status === 'accepted' ? 'Accepted' : appointment.status === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span><span className="font-medium">Patient:</span> {appointment.patientName || 'Unknown'}</span>
              <span><span className="font-medium">Doctor:</span> {appointment.doctorName || 'Unknown'}</span>
            </div>
            <div className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {appointment.notes || '-'}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {userRole === 'doctor' ? (
                <>
                  <button
                    className="transition-all duration-150 ease-in-out bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 w-24"
                    onClick={() => handleAppointmentAction(appointment.id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="transition-all duration-150 ease-in-out bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 w-24"
                    onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              ) : (
                appointment.status === 'rejected' && (
                  <Link href="/dashboard/new-appointment">
                    <button className="transition-all duration-150 ease-in-out bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-28">
                      Reschedule
                    </button>
                  </Link>
                )
              )}
              {/* Dismiss Button */}
              <button
                className="ml-auto transition-all duration-150 ease-in-out bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => handleDismissNotification(appointment.id)}
                aria-label="Dismiss notification"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
