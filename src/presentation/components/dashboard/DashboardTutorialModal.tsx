'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const slidesRef = useRef<Slide[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen, role]);

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the modal for accessibility.
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        setStep((s) => Math.max(0, s - 1));
        return;
      }
      if (e.key === 'ArrowRight') {
        const max = Math.max(0, slidesRef.current.length - 1);
        setStep((s) => Math.min(max, s + 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

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

  slidesRef.current = slides;

  if (!isOpen) return null;
  const active = slides[Math.min(step, slides.length - 1)];
  const isFirst = step === 0;
  const isLast = step >= slides.length - 1;

  return (
    <div className={`fixed inset-0 ${z.modal}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative ${z.modalContent} min-h-[100dvh] flex items-center justify-center p-4`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('tutorialTitle', { defaultValue: 'Quick tour' })}
          className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{t('tutorialTitle', { defaultValue: 'Quick tour' })}</p>
                <p className="text-sm text-white/85 mt-0.5">{t('tutorialSubtitle', { defaultValue: 'A quick overview of the essentials.' })}</p>
              </div>
            <button
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition"
              aria-label={t('close') || 'Close'}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden />
            </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5" aria-label={t('tutorialSteps', { defaultValue: 'Steps' })}>
                {slides.map((_, i) => {
                  const isActive = i === step;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStep(i)}
                      className={[
                        'h-2.5 rounded-full transition',
                        isActive ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70',
                      ].join(' ')}
                      aria-label={`${t('step', { defaultValue: 'Step' })} ${i + 1}`}
                    />
                  );
                })}
              </div>
              <span className="ml-auto text-xs text-white/85">
                {t('step', { defaultValue: 'Step' })} {step + 1}/{slides.length}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_280px]">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br ${active.accentClass} shadow-md ring-1 ring-black/5 flex items-center justify-center`}
                >
                  <active.Icon className="h-6 w-6 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900">{active.title}</h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{active.body}</p>
                </div>
              </div>

              {active.href && (
                <div className="mt-5">
                  <Link
                    href={active.href}
                    onClick={() => onComplete()}
                    className="btn btn-primary btn-xs"
                  >
                    {active.hrefLabel || t('open', { defaultValue: 'Open' })}
                  </Link>
                </div>
              )}
            </div>

            <aside className="border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                {t('tutorialSteps', { defaultValue: 'Steps' })}
              </p>
              <div className="mt-3 space-y-2">
                {slides.map((s, i) => {
                  const isActive = i === step;
                  const ItemIcon = s.Icon;
                  return (
                    <button
                      key={`${i}-${s.title}`}
                      type="button"
                      onClick={() => setStep(i)}
                      className={[
                        'w-full text-left rounded-xl border transition p-3 flex items-start gap-3',
                        isActive
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'bg-white/60 border-slate-200/60 hover:bg-white hover:border-slate-200',
                      ].join(' ')}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <span className={`mt-0.5 inline-flex h-8 w-8 rounded-xl bg-gradient-to-br ${s.accentClass} items-center justify-center ring-1 ring-black/5`}>
                        <ItemIcon className="h-5 w-5 text-white" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-900 truncate">{s.title}</span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {t('step', { defaultValue: 'Step' })} {i + 1}/{slides.length}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>

          <div className="px-5 py-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <button
              type="button"
              className="btn btn-ghost btn-xs w-full sm:w-auto"
              onClick={onComplete}
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
  );
}
