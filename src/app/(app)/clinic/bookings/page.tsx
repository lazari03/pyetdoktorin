'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useClinicBookings } from '@/presentation/hooks/useClinicBookings';
import { CLINIC_PATHS } from '@/navigation/paths';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { UserRole } from '@/domain/entities/UserRole';

export default function ClinicBookingsPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { bookings, loading, error, refresh, updateStatus } = useClinicBookings({ clinicId: user?.uid });

  if (role !== UserRole.Clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">{t('accessDenied') || 'Access denied'}</div>
      </div>
    );
  }

  return (
    <RequestStateGate
      loading={loading && bookings.length === 0}
      error={error}
      onRetry={refresh}
      homeHref={CLINIC_PATHS.root}
      loadingLabel={t('loading')}
      analyticsPrefix="clinic.bookings"
    >
      <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h1 className="text-[15px] font-bold text-gray-900">{t('clinicBookings') || 'Clinic bookings'}</h1>
        <p className="text-[12.5px] text-gray-500">{t('clinicBookingsSubtitle') || 'Manage incoming booking requests'}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-4 py-2.5">
                {t('patient') || 'Patient'}
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                {t('note') || 'Note'}
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                {t('preferredDate') || 'Preferred date'}
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                {t('status') || 'Status'}
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  {t('loading') || 'Loading...'}
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  {t('noBookingsYet') || 'No bookings yet'}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[12.5px] font-semibold text-gray-900">{booking.patientName}</div>
                    <div className="text-[10.5px] text-gray-400">{booking.patientEmail}</div>
                    <div className="text-[10.5px] text-gray-400">{booking.patientPhone}</div>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-gray-500 max-w-sm">{booking.note}</td>
                  <td className="px-3 py-3 text-[12px] text-gray-700">{booking.preferredDate || t('notProvided') || 'Not provided'}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'declined'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => updateStatus(booking.id, 'confirmed')}
                      className="px-3 py-1 rounded-lg text-[11.5px] font-semibold text-green-600 hover:bg-green-50"
                    >
                      {t('accept') || 'Accept'}
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'declined')}
                      className="px-3 py-1 rounded-lg text-[11.5px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      {t('decline') || 'Decline'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    </RequestStateGate>
  );
}
