'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useClinicBookings } from '@/presentation/hooks/useClinicBookings';
import { format } from 'date-fns';
import { CLINIC_PATHS } from '@/navigation/paths';
import { UserRole } from '@/domain/entities/UserRole';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';

export default function ClinicCalendarPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { bookings, loading, error, refresh } = useClinicBookings({ clinicId: user?.uid });

  if (role !== UserRole.Clinic) {
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
    <RequestStateGate
      loading={loading && bookings.length === 0}
      error={error}
      onRetry={refresh}
      homeHref={CLINIC_PATHS.root}
      loadingLabel={t('loading')}
      analyticsPrefix="clinic.calendar"
    >
      <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-gray-900">{t('clinicCalendar') || 'Clinic calendar'}</h1>
          <p className="text-[12.5px] text-gray-500">{t('clinicCalendarSubtitle') || 'Review your daily schedule'}</p>
        </div>
        <Link href={CLINIC_PATHS.bookings} className="text-[12.5px] font-semibold text-purple-600 hover:underline">
          {t('goToBookings') || 'Go to bookings'}
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-10">{t('loading') || 'Loading...'}</div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500 text-center">
          {t('noBookingsYet') || 'No bookings yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-900">
                    {format(new Date(dateKey), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
                <span className="text-[11.5px] text-gray-500">{grouped[dateKey].length} {t('bookings') || 'bookings'}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {grouped[dateKey].map((booking) => (
                  <div key={booking.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                    <div>
                      <p className="text-[12.5px] font-semibold text-gray-900">{booking.patientName}</p>
                      <p className="text-[12px] text-gray-500">{booking.note}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </RequestStateGate>
  );
}
