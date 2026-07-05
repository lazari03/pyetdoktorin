'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PhoneArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { DASHBOARD_PATHS } from '@/navigation/paths';

type Action = {
  key: string;
  label: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconDefault: string;
  iconHover: string;
  bgDefault: string;
  bgHover: string;
  textDefault: string;
  textHover: string;
};

export function PatientQuickActions() {
  const { t } = useTranslation();

  const actions: Action[] = [
    {
      key: 'book',
      label: t('bookNow') || 'Rezervoni tani',
      href: DASHBOARD_PATHS.newAppointment,
      Icon: CalendarIcon,
      iconDefault: 'text-purple-600',
      iconHover: 'group-hover:text-white',
      bgDefault: 'bg-purple-50 border-purple-200',
      bgHover: 'group-hover:bg-purple-600 group-hover:border-purple-700',
      textDefault: 'text-purple-700',
      textHover: 'group-hover:text-white',
    },
    {
      key: 'prescriptions',
      label: t('myPrescriptions') || 'My Prescriptions',
      href: DASHBOARD_PATHS.reciepes,
      Icon: DocumentTextIcon,
      iconDefault: 'text-teal-600',
      iconHover: 'group-hover:text-white',
      bgDefault: 'bg-teal-50 border-teal-200',
      bgHover: 'group-hover:bg-teal-600 group-hover:border-teal-700',
      textDefault: 'text-teal-700',
      textHover: 'group-hover:text-white',
    },
    {
      key: 'clinics',
      label: t('privateClinics') || 'Klinika private',
      href: DASHBOARD_PATHS.clinics,
      Icon: BuildingOfficeIcon,
      iconDefault: 'text-indigo-600',
      iconHover: 'group-hover:text-white',
      bgDefault: 'bg-indigo-50 border-indigo-200',
      bgHover: 'group-hover:bg-indigo-600 group-hover:border-indigo-700',
      textDefault: 'text-indigo-700',
      textHover: 'group-hover:text-white',
    },
    {
      key: 'emergency',
      label: t('emergency') || 'Emergency',
      href: DASHBOARD_PATHS.newAppointment,
      Icon: PhoneArrowUpRightIcon,
      iconDefault: 'text-red-600',
      iconHover: 'group-hover:text-white',
      bgDefault: 'bg-red-50 border-red-200',
      bgHover: 'group-hover:bg-red-600 group-hover:border-red-700',
      textDefault: 'text-red-600',
      textHover: 'group-hover:text-white',
    },
  ];

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
      <p className="text-[12.5px] font-bold text-gray-900 mb-3">{t('quickActions') || 'Quick actions'}</p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ key, label, href, Icon, iconDefault, bgDefault }) => (
          <Link
            key={key}
            href={href}
            className={`group flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-2.5 py-2.5 text-left transition-colors hover:border-purple-200 hover:bg-purple-50/60 min-w-0`}
            data-analytics={`dashboard.quick_action.${key}`}
          >
            <span className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${bgDefault} ${iconDefault}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11.5px] font-semibold text-gray-700 leading-tight truncate">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
