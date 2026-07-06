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
import {
  CalendarDaysIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CLINIC_PATHS } from '@/navigation/paths';
import { UserRole } from '@/domain/entities/UserRole';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';import { DashboardTutorialGate } from '@/presentation/components/dashboard/DashboardTutorialGate';

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
  const { bookings, loading, error, refresh } = useClinicBookings({ clinicId: user?.uid });
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

  if (role !== UserRole.Clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          {t('accessDenied') || 'Access denied'}
        </div>
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
      skeleton={<StatsPageSkeleton cardCount={3} />}
      analyticsPrefix="clinic.dashboard"
    >
      {user?.uid ? <DashboardTutorialGate userId={user.uid} role={role} /> : null}
      <div className="space-y-3">
        {/* 4×KPI row */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Bookings', value: bookings.length, helper: 'All time',
              Icon: CalendarDaysIcon, iconBg: 'bg-purple-100 text-purple-600', accent: 'text-purple-700',
              delta: earningsData.currentMonthAppointments > 0 ? `+${earningsData.currentMonthAppointments} this month` : null, pos: true,
            },
            {
              label: 'Monthly Revenue', value: `€${earningsData.currentMonthEarnings.toFixed(0)}`, helper: 'Current month payout',
              Icon: BanknotesIcon, iconBg: 'bg-teal-100 text-teal-600', accent: 'text-teal-700',
              delta: earningsData.currentMonthEarnings > earningsData.previousMonthEarnings
                ? `+€${(earningsData.currentMonthEarnings - earningsData.previousMonthEarnings).toFixed(0)} vs last mo.`
                : earningsData.previousMonthEarnings > earningsData.currentMonthEarnings
                  ? `−€${(earningsData.previousMonthEarnings - earningsData.currentMonthEarnings).toFixed(0)} vs last mo.`
                  : null,
              pos: earningsData.currentMonthEarnings >= earningsData.previousMonthEarnings,
            },
            {
              label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, helper: 'Scheduled visits',
              Icon: CheckCircleIcon, iconBg: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-700', delta: null, pos: true,
            },
            {
              label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, helper: 'Awaiting review',
              Icon: ClockIcon, iconBg: 'bg-amber-100 text-amber-600', accent: 'text-amber-700', delta: null, pos: false,
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <card.Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-bold leading-none ${card.accent}`}>{card.value}</p>
                {card.delta && (
                  <span className={`self-end mb-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full ${card.pos ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {card.delta}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">{card.helper}</p>
            </div>
          ))}
        </section>

	      <div className="grid gap-3 lg:grid-cols-3">
	        <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col">
	          <div className="flex items-center justify-between mb-3">
	            <p className="text-[13.5px] font-bold text-gray-900">{t('recentPatients') ?? 'Recent patients'}</p>
	            <Link href={CLINIC_PATHS.bookings} className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800">
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

        <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13.5px] font-bold text-gray-900">{t('activeBookings') ?? 'Active bookings'}</p>
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
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-600 font-semibold">{t('confirmed') ?? 'Confirmed'}</p>
              <p className="text-lg font-semibold text-gray-900">{bookings.filter((b) => b.status === 'confirmed').length}</p>
              <p className="text-[11px] text-gray-600">{t('scheduled') || 'Scheduled'}</p>
            </div>
          </div>
	          <Link href={CLINIC_PATHS.calendar} className="w-full text-center py-3 px-4 rounded-xl bg-purple-50 text-purple-600 text-sm font-semibold hover:bg-purple-100 transition-colors mt-auto">
	            {t('viewCalendar') || 'View calendar'}
	          </Link>
	        </section>
	      </div>

      <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
	        <div className="flex items-center justify-between mb-3">
	          <h2 className="text-[13.5px] font-bold text-gray-900">{t('latestRequests') || 'Latest requests'}</h2>
	          <Link href={CLINIC_PATHS.bookings} className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800">
	            {t('viewAll')}
	          </Link>
	        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <p className="text-center text-gray-500 py-6">{t('loading') || 'Loading...'}</p>
          ) : bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{booking.patientName}</p>
                <p className="text-xs text-gray-600">{booking.note}</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  booking.status === 'confirmed'
                    ? 'bg-green-50 text-green-700'
                    : booking.status === 'declined'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </section>
      </div>
    </RequestStateGate>
  );
}
