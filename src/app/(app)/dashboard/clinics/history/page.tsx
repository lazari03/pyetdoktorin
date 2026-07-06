'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { backendFetch } from '@/network/backendClient';
import { ClinicBooking } from '@/domain/entities/ClinicBooking';
import { UserRole } from '@/domain/entities/UserRole';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { ListSkeleton } from '@/presentation/components/Skeleton/ListSkeleton';
export default function ClinicBookingHistoryPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<ClinicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendFetch<{ items: ClinicBooking[] }>('/api/clinics/bookings');
      setBookings(response.items);
    } catch (err) {
      console.error('Failed to load clinic bookings', err);
      setBookings([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (role !== UserRole.Patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          {t('patientsOnly') || 'Available for patients only'}
        </div>
      </div>
    );
  }

  return (
    <RequestStateGate
      loading={loading && bookings.length === 0}
      error={error}
      onRetry={load}
      homeHref={DASHBOARD_PATHS.clinics}
      loadingLabel={t('loading')}
      skeleton={<ListSkeleton />}
      analyticsPrefix="dashboard.clinics_history"
    >
      <div>
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-[15px] font-bold text-gray-900">{t('clinicBookingHistory') || 'Clinic booking history'}</h1>
              <p className="text-[12.5px] text-gray-500">
                {t('clinicBookingHistorySubtitle') || 'Track your requests and their status'}
              </p>
            </div>
            <Link
              href={DASHBOARD_PATHS.clinics}
              className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
              data-analytics="dashboard.clinics_history.book_another"
            >
              {t('bookAnotherClinic') || 'Book another clinic'}
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-4 py-2.5">
                      {t('clinic') || 'Clinic'}
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
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        {t('noClinicBookings') || 'No clinic bookings yet'}
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-[12.5px] font-semibold text-gray-900">{booking.clinicName}</div>
                          <div className="text-[10.5px] text-gray-400">{new Date(booking.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-gray-500">{booking.note}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-700">
                          {booking.preferredDate || t('notProvided') || 'Not provided'}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-50 text-green-700'
                                : booking.status === 'declined'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}
