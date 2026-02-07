'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { backendFetch } from '@/network/backendClient';
import { ClinicBooking } from '@/domain/entities/ClinicBooking';
import { UserRole } from '@/domain/entities/UserRole';

export default function ClinicBookingHistoryPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<ClinicBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await backendFetch<{ items: ClinicBooking[] }>('/api/clinics/bookings');
        setBookings(response.items);
      } catch (error) {
        console.error('Failed to load clinic bookings', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('clinicBookingHistory') || 'Clinic booking history'}</h1>
          <p className="text-sm text-gray-600">
            {t('clinicBookingHistorySubtitle') || 'Track your requests and their status'}
          </p>
        </div>
        <Link href="/dashboard/clinics" className="text-sm text-purple-600 hover:underline">
          {t('bookAnotherClinic') || 'Book another clinic'}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow border border-purple-50 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('clinic') || 'Clinic'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('note') || 'Note'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('preferredDate') || 'Preferred date'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('status') || 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {t('loading') || 'Loading...'}
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {t('noClinicBookings') || 'No clinic bookings yet'}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900">{booking.clinicName}</div>
                    <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {booking.note}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {booking.preferredDate || t('notProvided') || 'Not provided'}
                  </td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
