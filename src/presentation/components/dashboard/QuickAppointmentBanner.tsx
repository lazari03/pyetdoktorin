'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BoltIcon, CheckCircleIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useQuickAppointmentRecommendations } from '@/presentation/hooks/useQuickAppointmentRecommendations';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import type { QuickAppointmentMatch } from '@/domain/entities/QuickAppointment';

type Step = 'idle' | 'specialty' | 'time' | 'searching' | 'results' | 'success';

const STEP_HEIGHT: Record<Exclude<Step, 'results'>, number> = {
  idle: 56,
  specialty: 196,
  time: 220,
  searching: 108,
  success: 200,
};

// header(28) + padding(24) + per card(80) + gap between cards(8)
function resultsHeight(count: number): number {
  if (count === 0) return 100;
  return 52 + count * 80 + (count - 1) * 8;
}

const MIN_LEAD_MINUTES = 10;

function buildAvailableSlots(): string[] {
  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_MINUTES;
  const slots: string[] = [];
  for (let m = minMinutes % 30 === 0 ? minMinutes : minMinutes + (30 - (minMinutes % 30)); m < 24 * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

export function QuickAppointmentBanner() {
  const { user } = useAuth();
  const { createAppointmentUseCase } = useDI();
  const qa = useQuickAppointmentRecommendations();

  const [step, setStep] = useState<Step>('idle');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookedDoctor, setBookedDoctor] = useState<{ name: string; date: string; time: string } | null>(null);
  const [availableSlots] = useState<string[]>(buildAvailableSlots);

  // doctors already shown to the user this session — deprioritised on next search
  const shownRef = useRef(new Set<string>());
  const [sortedSuggestions, setSortedSuggestions] = useState<QuickAppointmentMatch[]>([]);

  useEffect(() => {
    if (qa.suggestions.length === 0) { setSortedSuggestions([]); return; }
    const seen = shownRef.current;
    const sorted = [...qa.suggestions]
      .sort((a, b) => {
        // unseen doctors first
        const aNew = !seen.has(a.doctorId);
        const bNew = !seen.has(b.doctorId);
        if (aNew !== bNew) return aNew ? -1 : 1;
        // within same group: closest available time first
        const td = a.nextAvailableInMinutes - b.nextAvailableInMinutes;
        if (td !== 0) return td;
        // random tiebreak so equal-time doctors rotate
        return Math.random() - 0.5;
      })
      .slice(0, 3);
    sorted.forEach((d) => seen.add(d.doctorId));
    setSortedSuggestions(sorted);
  }, [qa.suggestions]);

  const sectionHeight = step === 'results'
    ? resultsHeight(sortedSuggestions.length)
    : STEP_HEIGHT[step];

  useEffect(() => {
    if (step === 'searching' && !qa.loading) {
      setStep('results');
    }
  }, [qa.loading, step]);

  // auto-select first available slot when entering the time step
  useEffect(() => {
    if (step === 'time' && availableSlots.length > 0 && !availableSlots.includes(qa.preferredTime)) {
      qa.setPreferredTime(availableSlots[0]);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    shownRef.current.clear();
    setStep('idle');
    setBookError(null);
    qa.onReset();
  };

  const handleBook = async (doctor: QuickAppointmentMatch) => {
    if (!user?.uid || !user?.name) return;
    setBooking(true);
    setBookError(null);
    trackAnalyticsEvent('quick_appointment_booking_attempt', {
      doctorId: doctor.doctorId,
      doctorName: doctor.doctorName,
      preferredDate: doctor.nextAvailableDate,
      preferredTime: doctor.nextAvailableTime,
    });
    try {
      await createAppointmentUseCase.execute({
        doctorId: doctor.doctorId,
        doctorName: doctor.doctorName,
        appointmentType: 'Quick appointment',
        preferredDate: doctor.nextAvailableDate,
        preferredTime: doctor.nextAvailableTime,
        note: '',
      });
      trackAnalyticsEvent('quick_appointment_booked', {
        doctorId: doctor.doctorId,
        preferredDate: doctor.nextAvailableDate,
        preferredTime: doctor.nextAvailableTime,
      });
      setBookedDoctor({ name: doctor.doctorName, date: doctor.nextAvailableDate, time: doctor.nextAvailableTime });
      setStep('success');
    } catch (err) {
      trackAnalyticsEvent('quick_appointment_booking_failed', { doctorId: doctor.doctorId });
      setBookError(err instanceof Error ? err.message : 'Booking failed. Try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <section
      className="card-premium card-accent card-accent-violet overflow-hidden"
      style={{
        height: sectionHeight,
        transition: 'height 360ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="h-full flex flex-col p-3 sm:p-4">

        {/* ── IDLE: single-line banner ── */}
        {step === 'idle' && (
          <div className="flex items-center justify-between gap-3 h-full">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 rounded-full bg-violet-100 border border-violet-200 p-1.5">
                <BoltIcon className="h-3.5 w-3.5 text-violet-700" />
              </span>
              <p className="text-sm font-semibold text-gray-900 truncate">Quick appointment</p>
              <span className="hidden sm:inline text-xs text-gray-400">— find a doctor in seconds</span>
            </div>
            <button
              type="button"
              data-analytics="quick_appointment.start"
              onClick={() => { trackAnalyticsEvent('quick_appointment_started'); setStep('specialty'); }}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition"
            >
              Start <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── STEP 1: specialty ── */}
        {step === 'specialty' && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">1 of 2</span>
              <button type="button" onClick={reset} className="text-[11px] text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>
            <p className="text-sm font-semibold text-gray-900">What type of doctor?</p>
            <select
              value={qa.selectedSpecialty}
              onChange={(e) => qa.setSpecialty(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">Any specialty</option>
              {qa.specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              data-analytics="quick_appointment.specialty_next"
              onClick={() => { trackAnalyticsEvent('quick_appointment_specialty_selected', { specialty: qa.selectedSpecialty || 'any' }); setStep('time'); }}
              className="mt-auto w-full rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── STEP 2: time chips ── */}
        {step === 'time' && (
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">2 of 2</span>
              <button type="button" onClick={reset} className="text-[11px] text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>
            <p className="text-sm font-semibold text-gray-900">When would you like to be seen?</p>
            {availableSlots.length === 0 ? (
              <p className="flex-1 text-xs text-gray-400 italic">No slots available today — try again tomorrow.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 flex-1 content-start overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => qa.setPreferredTime(slot)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      qa.preferredTime === slot
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStep('specialty')}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-700 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={availableSlots.length === 0}
                data-analytics="quick_appointment.find_matches"
                onClick={() => { trackAnalyticsEvent('quick_appointment_time_selected', { preferredTime: qa.preferredTime }); qa.onSearch(); setStep('searching'); }}
                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-50"
              >
                Find matches
              </button>
            </div>
          </div>
        )}

        {/* ── SEARCHING ── */}
        {step === 'searching' && (
          <div className="flex flex-col items-center justify-center gap-3 h-full">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:240ms]" />
            </div>
            <p className="text-xs text-gray-500">Finding best doctors for you…</p>
          </div>
        )}

        {/* ── RESULTS: 1–3 cards, closest first, first one highlighted ── */}
        {step === 'results' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
                {sortedSuggestions.length === 0 ? 'No matches' : `${sortedSuggestions.length} match${sortedSuggestions.length > 1 ? 'es' : ''}`}
              </p>
              <button type="button" onClick={reset} className="text-[11px] text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>

            {bookError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">{bookError}</p>
            )}

            {sortedSuggestions.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-4">No doctors available. Try different filters.</p>
            ) : (
              sortedSuggestions.map((doctor, idx) => (
                <article
                  key={doctor.doctorId}
                  className={`rounded-xl border p-2.5 shadow-sm ${
                    idx === 0
                      ? 'border-violet-200 bg-violet-50/50 ring-1 ring-violet-200/60'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{doctor.doctorName}</p>
                        {idx === 0 && (
                          <span className="shrink-0 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Best
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{doctor.specialties.join(' · ')}</p>
                    </div>
                    <button
                      type="button"
                      disabled={booking}
                      data-analytics="quick_appointment.book_doctor"
                      data-analytics-id={doctor.doctorId}
                      onClick={() => handleBook(doctor)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        idx === 0
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'border border-violet-200 text-violet-700 bg-white hover:bg-violet-50'
                      }`}
                    >
                      {booking ? '…' : 'Book'}
                    </button>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-violet-600">
                    <ClockIcon className="h-3 w-3 shrink-0" />
                    {doctor.nextAvailableTime} · {doctor.nextAvailableDate}
                  </p>
                </article>
              ))
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center gap-3 h-full text-center">
            <CheckCircleIcon className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Appointment sent!</p>
              {bookedDoctor && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {bookedDoctor.name} · {bookedDoctor.date} at {bookedDoctor.time}
                </p>
              )}
            </div>
            <Link
              href={DASHBOARD_PATHS.appointments}
              data-analytics="quick_appointment.go_to_appointments"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              Go to my appointments <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
            <p className="text-[11px] text-gray-400">Pay the consultation fee to enable the join button.</p>
          </div>
        )}

      </div>
    </section>
  );
}
