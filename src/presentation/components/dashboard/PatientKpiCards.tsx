'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export type PatientKpiData = {
  upcomingVisits: number;
  prescriptions: number | null;
  totalVisits: number;
  pendingActions: number;
  spark?: {
    upcomingVisits: number[];
    prescriptions: number[];
    totalVisits: number[];
    pendingActions: number[];
  };
  delta?: {
    upcomingVisits: string | null;
    prescriptions: string | null;
    totalVisits: string | null;
    pendingActions: string | null;
  };
};

type KpiCard = {
  label: string;
  value: number | null;
  helper: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
  iconBg: string;
  hoverBg: string;
  spark: number[];
  sparkColor: string;
  delta: string | null;
  deltaPositive: boolean | null;
};

function Sparkline({ values, color, label }: { values: number[]; color: string; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="space-y-1">
      <div className="flex items-end gap-[2px] h-[24px]">
        {values.map((v, i) => (
          <span
            key={i}
            className={`flex-1 rounded-[2px] ${color}`}
            style={{
              height: `${Math.max(12, Math.round((v / max) * 100))}%`,
              opacity: i === values.length - 1 ? 1 : 0.35 + i * 0.09,
            }}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400 leading-none">{label}</p>
    </div>
  );
}

export function PatientKpiCards({
  data,
  loading,
}: {
  data: PatientKpiData;
  loading?: boolean;
}) {
  const cards: KpiCard[] = [
    {
      label: 'Upcoming Visits',
      value: data.upcomingVisits,
      helper: 'Scheduled consultations',
      href: DASHBOARD_PATHS.appointments,
      Icon: CalendarDaysIcon,
      accent: 'text-purple-700',
      iconBg: 'bg-purple-100 text-purple-600',
      hoverBg: 'hover:border-purple-300 hover:bg-purple-50/60',
      sparkColor: 'bg-purple-400',
      spark: data.spark?.upcomingVisits ?? [],
      delta: data.delta?.upcomingVisits ?? null,
      deltaPositive: data.delta?.upcomingVisits
        ? !data.delta.upcomingVisits.startsWith('−') && !data.delta.upcomingVisits.startsWith('-')
        : null,
    },
    {
      label: 'Prescriptions',
      value: data.prescriptions,
      helper: 'Issued to you',
      href: DASHBOARD_PATHS.reciepes,
      Icon: DocumentTextIcon,
      accent: 'text-teal-700',
      iconBg: 'bg-teal-100 text-teal-600',
      hoverBg: 'hover:border-teal-300 hover:bg-teal-50/60',
      sparkColor: 'bg-teal-400',
      spark: data.spark?.prescriptions ?? [],
      delta: data.delta?.prescriptions ?? null,
      deltaPositive: data.delta?.prescriptions
        ? !data.delta.prescriptions.startsWith('−') && !data.delta.prescriptions.startsWith('-')
        : null,
    },
    {
      label: 'Total Visits',
      value: data.totalVisits,
      helper: 'All time',
      href: DASHBOARD_PATHS.appointments,
      Icon: ClipboardDocumentListIcon,
      accent: 'text-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-600',
      hoverBg: 'hover:border-indigo-300 hover:bg-indigo-50/60',
      sparkColor: 'bg-indigo-400',
      spark: data.spark?.totalVisits ?? [],
      delta: data.delta?.totalVisits ?? null,
      deltaPositive: data.delta?.totalVisits
        ? !data.delta.totalVisits.startsWith('−') && !data.delta.totalVisits.startsWith('-')
        : null,
    },
    {
      label: 'Pending Actions',
      value: data.pendingActions,
      helper: 'Need your attention',
      href: `${DASHBOARD_PATHS.appointments}?filter=pending`,
      Icon: ExclamationCircleIcon,
      accent: data.pendingActions > 0 ? 'text-amber-700' : 'text-gray-600',
      iconBg: data.pendingActions > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500',
      hoverBg: data.pendingActions > 0
        ? 'hover:border-amber-300 hover:bg-amber-50/60'
        : 'hover:border-gray-300 hover:bg-gray-50/60',
      sparkColor: data.pendingActions > 0 ? 'bg-amber-400' : 'bg-gray-300',
      spark: data.spark?.pendingActions ?? [],
      delta: data.delta?.pendingActions ?? null,
      deltaPositive: false,
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.Icon;
        const showValue = !loading || card.value !== null;
        return (
          <Link
            key={card.label}
            href={card.href}
            className={`group bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5 transition-colors ${card.hoverBg}`}
            data-analytics={`dashboard.kpi.${card.label.toLowerCase().replace(/ /g, '_')}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
              <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-3xl font-bold leading-none ${card.accent}`}>
                {showValue && card.value !== null ? card.value : <span className="text-gray-300">—</span>}
              </p>
              {card.delta && (
                <span
                  className={`self-end mb-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full ${
                    card.deltaPositive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {card.delta}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 leading-none">{card.helper}</p>
            {card.spark.length > 0 && (
              <Sparkline values={card.spark} color={card.sparkColor} label="7-month trend" />
            )}
          </Link>
        );
      })}
    </section>
  );
}
