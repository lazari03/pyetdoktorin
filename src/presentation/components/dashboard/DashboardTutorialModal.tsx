'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  ArrowPathIcon,
  BellAlertIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  RectangleGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import { z } from '@/config/zIndex';
import { UserRole } from '@/domain/entities/UserRole';
import { DASHBOARD_PATHS, CLINIC_PATHS, PHARMACY_PATHS } from '@/navigation/paths';

type Slide = {
  title: string;
  body: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accentClass: string;
  href?: string;
  hrefLabel?: string;
};

type Props = {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onComplete: () => void;
};

export function DashboardTutorialModal({ isOpen, role, onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen, role]);

  const slides = useMemo<Slide[]>(() => {
    if (role === UserRole.Doctor) {
      return [
        {
          title: t('tutorialDoctorTitle1', { defaultValue: 'Manage your day in one place' }),
          body: t('tutorialDoctorBody1', { defaultValue: 'See your next consultation, pending actions, and jump into the room in one click.' }),
          Icon: RectangleGroupIcon,
          accentClass: 'from-purple-600 to-fuchsia-500',
          href: DASHBOARD_PATHS.appointments,
          hrefLabel: t('tutorialOpenAppointments', { defaultValue: 'Open appointments' }),
        },
        {
          title: t('tutorialDoctorTitle2', { defaultValue: 'Join video sessions instantly' }),
          body: t('tutorialDoctorBody2', { defaultValue: 'When it’s time, tap Join. You can also add the appointment to your calendar.' }),
          Icon: VideoCameraIcon,
          accentClass: 'from-indigo-600 to-sky-500',
          href: DASHBOARD_PATHS.doctorCalendar,
          hrefLabel: t('tutorialOpenCalendar', { defaultValue: 'Open calendar' }),
        },
        {
          title: t('tutorialDoctorTitle3', { defaultValue: 'Track earnings and performance' }),
          body: t('tutorialDoctorBody3', { defaultValue: 'Monitor monthly earnings and keep your workflow fast and predictable.' }),
          Icon: ChartBarSquareIcon,
          accentClass: 'from-emerald-600 to-teal-500',
          href: DASHBOARD_PATHS.earnings,
          hrefLabel: t('tutorialOpenEarnings', { defaultValue: 'Open earnings' }),
        },
      ];
    }

    if (role === UserRole.Clinic) {
      return [
        {
          title: t('tutorialClinicTitle1', { defaultValue: 'Monitor bookings in real time' }),
          body: t('tutorialClinicBody1', { defaultValue: 'See new bookings, recent patients, and clinic performance at a glance.' }),
          Icon: ClipboardDocumentListIcon,
          accentClass: 'from-purple-600 to-fuchsia-500',
          href: CLINIC_PATHS.bookings,
          hrefLabel: t('tutorialOpenBookings', { defaultValue: 'Open bookings' }),
        },
        {
          title: t('tutorialClinicTitle2', { defaultValue: 'Keep everyone scheduled' }),
          body: t('tutorialClinicBody2', { defaultValue: 'Use the clinic calendar to coordinate staff and avoid overlaps.' }),
          Icon: CalendarDaysIcon,
          accentClass: 'from-indigo-600 to-sky-500',
          href: CLINIC_PATHS.calendar,
          hrefLabel: t('tutorialOpenCalendar', { defaultValue: 'Open calendar' }),
        },
        {
          title: t('tutorialClinicTitle3', { defaultValue: 'Stay on top of updates' }),
          body: t('tutorialClinicBody3', { defaultValue: 'Notifications keep your team aligned with changes and actions.' }),
          Icon: BellAlertIcon,
          accentClass: 'from-amber-500 to-orange-500',
          href: CLINIC_PATHS.notifications,
          hrefLabel: t('tutorialOpenNotifications', { defaultValue: 'Open notifications' }),
        },
      ];
    }

    if (role === UserRole.Pharmacy) {
      return [
        {
          title: t('tutorialPharmacyTitle1', { defaultValue: 'Process e-prescriptions faster' }),
          body: t('tutorialPharmacyBody1', { defaultValue: 'Review new prescriptions, confirm status, and reduce manual work.' }),
          Icon: DocumentTextIcon,
          accentClass: 'from-purple-600 to-fuchsia-500',
          href: PHARMACY_PATHS.reciepes,
          hrefLabel: t('tutorialOpenPrescriptions', { defaultValue: 'Open prescriptions' }),
        },
        {
          title: t('tutorialPharmacyTitle2', { defaultValue: 'Always know what needs action' }),
          body: t('tutorialPharmacyBody2', { defaultValue: 'Your dashboard surfaces pending items and recent activity.' }),
          Icon: BoltIcon,
          accentClass: 'from-indigo-600 to-sky-500',
          href: PHARMACY_PATHS.notifications,
          hrefLabel: t('tutorialOpenNotifications', { defaultValue: 'Open notifications' }),
        },
        {
          title: t('tutorialPharmacyTitle3', { defaultValue: 'Maintain a clean workflow' }),
          body: t('tutorialPharmacyBody3', { defaultValue: 'Use clear statuses to keep your operations consistent and auditable.' }),
          Icon: ArrowPathIcon,
          accentClass: 'from-emerald-600 to-teal-500',
          href: PHARMACY_PATHS.profile,
          hrefLabel: t('tutorialOpenProfile', { defaultValue: 'Open profile' }),
        },
      ];
    }

    // Patient (default)
    return [
      {
        title: t('tutorialPatientTitle1', { defaultValue: 'Book and manage appointments' }),
        body: t('tutorialPatientBody1', { defaultValue: 'See upcoming visits, pay securely, and join video with one tap.' }),
        Icon: PlusCircleIcon,
        accentClass: 'from-purple-600 to-fuchsia-500',
        href: DASHBOARD_PATHS.newAppointment,
        hrefLabel: t('tutorialBookNow', { defaultValue: 'Book now' }),
      },
      {
        title: t('tutorialPatientTitle2', { defaultValue: 'Never miss a visit' }),
        body: t('tutorialPatientBody2', { defaultValue: 'Add appointments to your calendar and open the meeting link directly from there.' }),
        Icon: CalendarDaysIcon,
        accentClass: 'from-indigo-600 to-sky-500',
        href: DASHBOARD_PATHS.appointments,
        hrefLabel: t('tutorialOpenAppointments', { defaultValue: 'Open appointments' }),
      },
      {
        title: t('tutorialPatientTitle3', { defaultValue: 'Stay updated with notifications' }),
        body: t('tutorialPatientBody3', { defaultValue: 'Get a clear feed of updates and actions from your care team.' }),
        Icon: BellAlertIcon,
        accentClass: 'from-amber-500 to-orange-500',
        href: DASHBOARD_PATHS.notifications,
        hrefLabel: t('tutorialOpenNotifications', { defaultValue: 'Open notifications' }),
      },
    ];
  }, [role, t]);

  if (!isOpen) return null;
  const active = slides[Math.min(step, slides.length - 1)];
  const isFirst = step === 0;
  const isLast = step >= slides.length - 1;
  const progressPct = slides.length > 0 ? ((step + 1) / slides.length) * 100 : 0;

  return (
    <div className={`fixed inset-0 ${z.modal}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative ${z.modalContent} min-h-[100dvh] flex items-center justify-center p-4`}>
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-4xl card-premium overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {t('tutorialTitle', { defaultValue: 'Quick tour' })}
              </p>
              <p className="text-xs text-slate-600">
                {t('tutorialSubtitle', { defaultValue: 'Learn what you can do in seconds.' })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 hover:bg-white transition"
              aria-label={t('close') || 'Close'}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative bg-gradient-to-br from-purple-50 to-white p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-200/70">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-slate-200/70 bg-white flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_10%,rgba(168,85,247,0.16),transparent_55%)]" aria-hidden />
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_90%,rgba(59,130,246,0.10),transparent_55%)]" aria-hidden />
                <div className={`relative h-28 w-28 rounded-3xl bg-gradient-to-br ${active.accentClass} shadow-lg ring-1 ring-black/5 flex items-center justify-center`}>
                  <active.Icon className="h-12 w-12 text-white" aria-hidden />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {t('step', { defaultValue: 'Step' })} {step + 1}/{slides.length}
                </span>
                <div className="flex-1 max-w-[220px] h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-[width] duration-300"
                    style={{ width: `${progressPct}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 flex flex-col">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900">{active.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{active.body}</p>

                {active.href && (
                  <div className="mt-4">
                    <Link
                      href={active.href}
                      onClick={() => {
                        onComplete();
                      }}
                      className="btn btn-primary btn-xs"
                    >
                      {active.hrefLabel || t('open', { defaultValue: 'Open' })}
                    </Link>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-6 border-t border-slate-200/70 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs w-full sm:w-auto"
                  onClick={() => {
                    onComplete();
                  }}
                >
                  {t('tutorialSkip', { defaultValue: 'Skip' })}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs w-full sm:w-auto"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={isFirst}
                  >
                    {t('back') || 'Back'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs w-full sm:w-auto"
                    onClick={() => {
                      if (isLast) {
                        onComplete();
                        return;
                      }
                      setStep((s) => Math.min(slides.length - 1, s + 1));
                    }}
                  >
                    {isLast ? t('tutorialDone', { defaultValue: 'Done' }) : t('next', { defaultValue: 'Next' })}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
