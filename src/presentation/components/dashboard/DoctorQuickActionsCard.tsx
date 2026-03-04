'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { Appointment } from '@/domain/entities/Appointment';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

type Props = {
  appointments: Appointment[];
};

function getTodayKey(): string {
  // en-CA reliably formats as YYYY-MM-DD in most environments (matches stored preferredDate).
  try {
    return new Date().toLocaleDateString('en-CA');
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function DoctorQuickActionsCard({ appointments }: Props) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const todayKey = getTodayKey();
    const dueToday = appointments.filter((a) => a.preferredDate === todayKey).length;
    const pendingRequests = appointments.filter((a) => (a.status || '').toString().toLowerCase() === 'pending').length;
    const pendingPayments = appointments.filter(
      (a) => (a.status || '').toString().toLowerCase() === 'accepted' && !a.isPaid
    ).length;
    return { dueToday, pendingRequests, pendingPayments };
  }, [appointments]);

  const actions = [
    {
      key: 'calendar',
      label: t('calendar') || 'Calendar',
      href: DASHBOARD_PATHS.doctorCalendar,
      Icon: CalendarDaysIcon,
      tone: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      key: 'appointments',
      label: (t('appointments') || 'Appointments').replace(/^\w/, (c) => c.toUpperCase()),
      href: DASHBOARD_PATHS.appointments,
      Icon: ClipboardDocumentListIcon,
      tone: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      key: 'earnings',
      label: t('earnings') || 'Earnings',
      href: DASHBOARD_PATHS.earnings,
      Icon: CurrencyDollarIcon,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      key: 'profile',
      label: t('myProfile') || 'My profile',
      href: DASHBOARD_PATHS.profile,
      Icon: UserCircleIcon,
      tone: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  ] as const;

  return (
    <section className="card-premium card-premium-hover card-accent card-accent-emerald p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{t('quickActions') || 'Quick actions'}</p>
          <p className="text-xs text-gray-600 mt-1">
            {t('doctorQuickActionsSubtitle') || 'Shortcuts to manage your schedule and patients.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-gray-700">
            {t('today') || 'Today'}: {stats.dueToday}
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/70 px-3 py-1 text-[11px] font-semibold text-amber-700">
            {t('pending') || 'Pending'}: {stats.pendingRequests}
          </span>
          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50/70 px-3 py-1 text-[11px] font-semibold text-rose-700">
            {t('waitingForPayment') || 'Waiting for payment'}: {stats.pendingPayments}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map(({ key, label, href, Icon, tone }) => (
          <Link
            key={key}
            href={href}
            className="group rounded-2xl border border-gray-200/70 bg-white/70 p-3 sm:p-4 hover:bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            aria-label={label}
            data-analytics={`dashboard.doctor_quick_actions.${key}`}
          >
            <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${tone}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('open') || 'Open'}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

