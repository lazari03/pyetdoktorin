'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useClinicBookings } from '@/presentation/hooks/useClinicBookings';
import { format } from 'date-fns';

export default function ClinicCalendarPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { bookings, loading } = useClinicBookings({ clinicId: user?.uid });

  if (role !== 'clinic') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">{t('accessDenied') || 'Access denied'}</div>
      </div>
    );
  }

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, booking) => {
    const dateKey = booking.preferredDate || booking.createdAt.split('T')[0];
    acc[dateKey] = acc[dateKey] ? [...acc[dateKey], booking] : [booking];
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('clinicCalendar') || 'Clinic calendar'}</h1>
          <p className="text-sm text-gray-600">{t('clinicCalendarSubtitle') || 'Review your daily schedule'}</p>
        </div>
        <Link href="/clinic/bookings" className="text-sm text-purple-600 hover:underline">
          {t('goToBookings') || 'Go to bookings'}
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">{t('loading') || 'Loading...'}</div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-gray-500 text-center">
          {t('noBookingsYet') || 'No bookings yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="bg-white rounded-2xl shadow border border-purple-50">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(new Date(dateKey), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{grouped[dateKey].length} {t('bookings') || 'bookings'}</span>
              </div>
              <div className="divide-y">
                {grouped[dateKey].map((booking) => (
                  <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.patientName}</p>
                      <p className="text-sm text-gray-600">{booking.note}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
