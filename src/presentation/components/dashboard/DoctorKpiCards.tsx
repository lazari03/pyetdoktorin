'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export type DoctorKpiData = {
  todayAppointments: number;
  pendingRequests: number;
  monthlyEarnings: number;
  activePatients: number;
};

export function DoctorKpiCards({ data }: { data: DoctorKpiData }) {
  const cards = [
    {
      label: "Today's Appointments",
      value: data.todayAppointments,
      helper: 'Scheduled for today',
      href: DASHBOARD_PATHS.appointments,
      Icon: CalendarDaysIcon,
      accent: 'text-purple-700',
      iconBg: 'bg-purple-100 text-purple-600',
      hoverBg: 'hover:border-purple-300 hover:bg-purple-50/60',
    },
    {
      label: 'Pending Requests',
      value: data.pendingRequests,
      helper: 'Awaiting your response',
      href: `${DASHBOARD_PATHS.appointments}?filter=pending`,
      Icon: ExclamationCircleIcon,
      accent: data.pendingRequests > 0 ? 'text-amber-700' : 'text-gray-600',
      iconBg: data.pendingRequests > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500',
      hoverBg: data.pendingRequests > 0
        ? 'hover:border-amber-300 hover:bg-amber-50/60'
        : 'hover:border-gray-300 hover:bg-gray-50/60',
    },
    {
      label: 'Earnings This Month',
      value: `$${data.monthlyEarnings.toFixed(2)}`,
      helper: 'Net payout so far',
      href: DASHBOARD_PATHS.earnings,
      Icon: CurrencyDollarIcon,
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      hoverBg: 'hover:border-emerald-300 hover:bg-emerald-50/60',
    },
    {
      label: 'Active Patients',
      value: data.activePatients,
      helper: 'Under your care',
      href: DASHBOARD_PATHS.patients,
      Icon: UserGroupIcon,
      accent: 'text-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-600',
      hoverBg: 'hover:border-indigo-300 hover:bg-indigo-50/60',
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.Icon;
        return (
          <Link
            key={card.label}
            href={card.href}
            className={`group bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5 transition-colors ${card.hoverBg}`}
            data-analytics={`dashboard.doctor_kpi.${card.label.toLowerCase().replace(/ /g, '_')}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className={`text-3xl font-bold leading-none ${card.accent}`}>{card.value}</p>
            <p className="text-[11px] text-gray-400 leading-none">{card.helper}</p>
          </Link>
        );
      })}
    </section>
  );
}
