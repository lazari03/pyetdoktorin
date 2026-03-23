'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import { UserRole } from '@/domain/entities/UserRole';
import { DASHBOARD_PATHS, dashboardVideoSessionUrl } from '@/navigation/paths';
import dynamic from 'next/dynamic';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import AppointmentDetailModal from '@/presentation/components/dashboard/AppointmentDetailModal';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { auth } from '@/config/firebaseconfig';
import { Appointment } from '@/domain/entities/Appointment';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { useToast } from '@/presentation/components/Toast/ToastProvider';
import { availabilityService } from '@/infrastructure/services/availabilityServiceAdapter';
import type { DoctorAvailability } from '@/domain/entities/DoctorAvailability';

import type { CalendarEvent } from '../Calendar';

const Calendar = dynamic(() => import('../Calendar'), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-purple-50 bg-white shadow-lg p-4">
      <div className="h-10 w-48 rounded-2xl bg-slate-100 animate-pulse" />
      <div className="mt-4 h-[68vh] min-h-[520px] rounded-2xl bg-slate-100 animate-pulse" />
    </div>
  ),
});

/** Convert "hh:mm AM/PM" or "HH:mm" → "HH:mm" 24-hour */
function normalizeTo24h(time: string): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const period = m[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m[2]}`;
  }
  return time;
}

export default function DoctorCalendarPage() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { appointments, loading, error, isAppointmentPast, fetchAppointments } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();
  const { updateAppointmentUseCase, generateRoomCodeUseCase } = useDI();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRedirecting, setShowRedirecting] = useState(false);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // One-time fetch only if store is empty (e.g. direct navigation to this page)
  useEffect(() => {
    if (appointments.length === 0 && role) {
      fetchAppointments(role);
    }
  }, [appointments.length, role, fetchAppointments]);

  useEffect(() => {
    let mounted = true;

    const loadAvailability = async () => {
      if (role !== UserRole.Doctor) {
        if (mounted) setAvailabilityLoading(false);
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const nextAvailability = await availabilityService.getMyAvailability();
        if (!mounted) return;
        setAvailability(nextAvailability);
      } catch (nextError) {
        if (!mounted) return;
        const message =
          nextError instanceof Error
            ? nextError.message
            : t('availabilityLoadError', {
                defaultValue: 'Failed to load availability.',
              });
        setAvailabilityError(message);
      } finally {
        if (mounted) setAvailabilityLoading(false);
      }
    };

    void loadAvailability();
    return () => {
      mounted = false;
    };
  }, [role, t]);

  // Map stored appointments → calendar events (stable reference via useMemo)
  const events = useMemo<CalendarEvent[]>(() =>
    appointments
      .filter(app => app.preferredDate && app.preferredTime)
      .map(app => {
        const time24 = normalizeTo24h(app.preferredTime);
        const start = new Date(`${app.preferredDate}T${time24}`);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          title: `${app.appointmentType || t('appointment')}${app.patientName ? ` ${t('with')} ${app.patientName}` : ''}`,
          start,
          end,
          resource: app,
        };
      }),
    [appointments, t]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if ((event.resource as { kind?: string } | undefined)?.kind === 'availability') {
      return;
    }
    const appointment = event.resource as Appointment;
    if (appointment) setSelectedAppointment(appointment);
  }, []);

  const handleJoinCall = useCallback(async (appointmentId: string) => {
    setSelectedAppointment(null);
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error('Appointment not found');
      if (isAppointmentPast(appointment)) {
        toast({ variant: 'error', message: t('appointmentPast') || 'This appointment has already passed.' });
        return;
      }

      setShowRedirecting(true);
      setAuthStatus(!!user, user?.uid || null, user?.name || null);

      if (!user?.uid) {
        setShowRedirecting(false);
        toast({ variant: 'error', message: t('joinCallLoginRequired') || 'You must be logged in to join a call.' });
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setShowRedirecting(false);
        toast({ variant: 'error', message: t('sessionExpired') || 'Your session has expired. Please log in again.' });
        return;
      }

      const idToken = await currentUser.getIdToken();
      const data = await generateRoomCodeUseCase.execute({
        user_id: user.uid,
        room_id: appointmentId,
        role: 'doctor',
        idToken,
      });

      const roomCode = data.roomCode || appointment.roomCode;
      const roomId = data.room_id || appointment.roomId;
      const sessionToken = data.sessionToken;

      if (!roomCode || !sessionToken) throw new Error('Missing room information from server');

      if ((!appointment.roomCode || !appointment.roomId) && roomCode && roomId) {
        await updateAppointmentUseCase.execute(appointmentId, { roomCode, roomId });
      }

      trackAnalyticsEvent('appointment_join_success', { appointmentId, role: 'doctor' });
      window.location.href = dashboardVideoSessionUrl(sessionToken);
    } catch (error) {
      setShowRedirecting(false);
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      toast({ variant: 'error', message });
    }
  }, [appointments, isAppointmentPast, user, generateRoomCodeUseCase, updateAppointmentUseCase, setAuthStatus, t, toast]);

  const upcomingCount = useMemo(() =>
    events.filter(e => {
      const end = e.end as Date | undefined;
      return end ? end > new Date() : false;
    }).length,
    [events]
  );

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath={DASHBOARD_PATHS.root}>
      <RequestStateGate
        loading={(loading && appointments.length === 0) || availabilityLoading}
        error={error || availabilityError}
        onRetry={() => {
          if (role) fetchAppointments(role);
          setAvailabilityLoading(true);
          setAvailabilityError(null);
          availabilityService
            .getMyAvailability()
            .then((nextAvailability) => {
              setAvailability(nextAvailability);
            })
            .catch((nextError) => {
              const message =
                nextError instanceof Error
                  ? nextError.message
                  : t('availabilityLoadError', {
                      defaultValue: 'Failed to load availability.',
                    });
              setAvailabilityError(message);
            })
            .finally(() => {
              setAvailabilityLoading(false);
            });
        }}
        homeHref={DASHBOARD_PATHS.root}
        loadingLabel={t('loading')}
        analyticsPrefix="doctor_calendar"
      >
        <div className="min-h-screen">
          <RedirectingModal show={showRedirecting} />
          <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 space-y-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                  {t('doctorCalendar') || 'Doctor calendar'}
                </p>
                <h1 className="text-3xl font-semibold text-gray-900 mt-1">
                  {t('yourAppointments') || 'Your appointments'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t('calendarHelper') || 'Manage your week and jump into calls on time.'}
                </p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                  {t('upcoming') || 'Upcoming'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {upcomingCount}
                </p>
              </div>
            </header>
            <Calendar
              events={events}
              availability={availability}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          {selectedAppointment && (
            <AppointmentDetailModal
              appointment={selectedAppointment}
              isPast={isAppointmentPast(selectedAppointment)}
              onClose={() => setSelectedAppointment(null)}
              onJoinCall={handleJoinCall}
            />
          )}
        </div>
      </RequestStateGate>
    </RoleGuard>
  );
}
