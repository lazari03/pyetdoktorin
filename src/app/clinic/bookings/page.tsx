'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useClinicBookings } from '@/presentation/hooks/useClinicBookings';

export default function ClinicBookingsPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { bookings, loading, updateStatus } = useClinicBookings({ clinicId: user?.uid });

  if (role !== 'clinic') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">{t('accessDenied') || 'Access denied'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('clinicBookings') || 'Clinic bookings'}</h1>
        <p className="text-sm text-gray-600">{t('clinicBookingsSubtitle') || 'Manage incoming booking requests'}</p>
      </div>

      <div className="bg-white rounded-2xl shadow border border-purple-50 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('patient') || 'Patient'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('note') || 'Note'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('preferredDate') || 'Preferred date'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('status') || 'Status'}
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {t('loading') || 'Loading...'}
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {t('noBookingsYet') || 'No bookings yet'}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900">{booking.patientName}</div>
                    <div className="text-xs text-gray-500">{booking.patientEmail}</div>
                    <div className="text-xs text-gray-500">{booking.patientPhone}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-sm">{booking.note}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{booking.preferredDate || t('notProvided') || 'Not provided'}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
                  <td className="px-4 py-4 text-right space-x-2">
                    <button
                      onClick={() => updateStatus(booking.id, 'confirmed')}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-green-600 hover:bg-green-50"
                    >
                      {t('accept') || 'Accept'}
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'declined')}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50"
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
  );
}
