'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useClinicBookings } from '@/presentation/hooks/useClinicBookings';
import { useMemo } from 'react';
import { ClinicBooking } from '@/domain/entities/ClinicBooking';
import { RecentPatientsList, RecentPatient } from '@/presentation/components/dashboard/RecentPatientsList';
import { DoctorEarningsCard } from '@/presentation/components/dashboard/DoctorEarningsCard';
import { APPOINTMENT_PRICE_EUR, DOCTOR_PAYOUT_RATE } from '@/config/paywallConfig';

function calculateClinicEarnings(bookings: ClinicBooking[]) {
  const payoutPercentage = DOCTOR_PAYOUT_RATE;
  const appointmentAmount = APPOINTMENT_PRICE_EUR;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const completed = bookings.filter((b) => b.status === 'confirmed');
  const currentMonthAppointments = completed.filter((b) => {
    const preferred = b.preferredDate || b.createdAt;
    const date = new Date(preferred);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthAppointments = completed.filter((b) => {
    const preferred = b.preferredDate || b.createdAt;
    const date = new Date(preferred);
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthlyHistory = [];
  for (let i = 0; i < 6; i++) {
    const monthIndex = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    const monthlyAppointments = completed.filter((b) => {
      const preferred = b.preferredDate || b.createdAt;
      const date = new Date(preferred);
      return date.getMonth() === monthIndex && date.getFullYear() === year;
    });
    monthlyHistory.push({
      month: monthNames[monthIndex],
      year,
      amount: monthlyAppointments.length * appointmentAmount * payoutPercentage,
      appointmentCount: monthlyAppointments.length,
    });
  }

  return {
    currentMonthEarnings: currentMonthAppointments.length * appointmentAmount * payoutPercentage,
    currentMonthAppointments: currentMonthAppointments.length,
    previousMonthEarnings: previousMonthAppointments.length * appointmentAmount * payoutPercentage,
    monthlyHistory,
  };
}

export default function ClinicDashboardPage() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { bookings, loading } = useClinicBookings({ clinicId: user?.uid });
  const earningsData = useMemo(() => calculateClinicEarnings(bookings), [bookings]);
  const recentPatients = useMemo<RecentPatient[]>(() => {
    const dictionary = bookings.reduce<Record<string, RecentPatient>>((acc, booking) => {
      if (!booking.patientId) return acc;
      acc[booking.patientId] = {
        id: booking.patientId,
        name: booking.patientName,
        appointmentType: booking.note,
        lastVisit: booking.preferredDate || booking.createdAt,
      };
      return acc;
    }, {});
    return Object.values(dictionary).slice(0, 3);
  }, [bookings]);

  if (role !== 'clinic') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          {t('accessDenied') || 'Access denied'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('clinicDashboard') || 'Clinic dashboard'}</h1>
        <p className="text-sm text-gray-600">{t('clinicDashboardDescription') || 'Monitor bookings and performance'}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">{t('recentPatients') ?? 'Recent patients'}</p>
            <Link href="/clinic/bookings" className="text-xs text-purple-600 hover:underline">
              {t('viewAll') || 'View all'}
            </Link>
          </div>
          <div className="flex-1">
            <RecentPatientsList patients={recentPatients} />
          </div>
        </section>

        <DoctorEarningsCard
          currentMonthEarnings={earningsData.currentMonthEarnings}
          currentMonthAppointments={earningsData.currentMonthAppointments}
          previousMonthEarnings={earningsData.previousMonthEarnings}
          monthlyHistory={earningsData.monthlyHistory}
        />

        <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('activeBookings') ?? 'Active bookings'}</p>
              <p className="text-4xl font-extrabold mt-1 text-purple-700">{bookings.length}</p>
              <p className="text-xs text-gray-600">{t('pendingAndConfirmed') || 'Pending and confirmed'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-purple-600 font-semibold">{t('pending') ?? 'Pending'}</p>
              <p className="text-lg font-semibold text-purple-800">{bookings.filter((b) => b.status === 'pending').length}</p>
              <p className="text-[11px] text-purple-700/80">{t('awaitingReview') || 'Awaiting review'}</p>
            </div>
            <div className="rounded-xl border border-gray-200 px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-600 font-semibold">{t('confirmed') ?? 'Confirmed'}</p>
              <p className="text-lg font-semibold text-gray-900">{bookings.filter((b) => b.status === 'confirmed').length}</p>
              <p className="text-[11px] text-gray-600">{t('scheduled') || 'Scheduled'}</p>
            </div>
          </div>
          <Link href="/clinic/calendar" className="w-full text-center py-3 px-4 rounded-xl bg-purple-50 text-purple-600 text-sm font-semibold hover:bg-purple-100 transition-colors mt-auto">
            {t('viewCalendar') || 'View calendar'}
          </Link>
        </section>
      </div>

      <section className="bg-white rounded-3xl shadow-lg p-4 border border-purple-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{t('latestRequests') || 'Latest requests'}</h2>
          <Link href="/clinic/bookings" className="text-xs text-purple-600 hover:underline">
            {t('viewAll')}
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <p className="text-center text-gray-500 py-6">{t('loading') || 'Loading...'}</p>
          ) : bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="py-4 flex items-center justify-between">
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
      </section>
    </div>
  );
}
