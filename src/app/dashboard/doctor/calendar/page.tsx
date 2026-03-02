'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import { UserRole } from '@/domain/entities/UserRole';
import { DASHBOARD_PATHS, dashboardVideoSessionUrl } from '@/navigation/paths';
import Calendar from '../Calendar';
import Loader from '@/presentation/components/Loader/Loader';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import AppointmentDetailModal from '@/presentation/components/dashboard/AppointmentDetailModal';
import { useAppointmentStore } from '../../../../store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '../../../../context/AuthContext';
import { useDI } from '@/context/DIContext';
import { auth } from '@/config/firebaseconfig';
import { Appointment } from '@/domain/entities/Appointment';
import { Event as RBCEvent } from 'react-big-calendar';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

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
  const { appointments, loading, isAppointmentPast, fetchAppointments } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();
  const { updateAppointmentUseCase, generateRoomCodeUseCase } = useDI();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRedirecting, setShowRedirecting] = useState(false);

  // One-time fetch only if store is empty (e.g. direct navigation to this page)
  useEffect(() => {
    if (appointments.length === 0 && role) {
      fetchAppointments(role);
    }
  }, [appointments.length, role, fetchAppointments]);

  // Map stored appointments → calendar events (stable reference via useMemo)
  const events = useMemo<RBCEvent[]>(() =>
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

  const handleSelectEvent = useCallback((event: RBCEvent) => {
    const appointment = event.resource as Appointment;
    if (appointment) setSelectedAppointment(appointment);
  }, []);

  const handleJoinCall = useCallback(async (appointmentId: string) => {
    setSelectedAppointment(null);
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error('Appointment not found');
      if (isAppointmentPast(appointment)) {
        alert(t('appointmentPast') || 'This appointment has already passed.');
        return;
      }

      setShowRedirecting(true);
      setAuthStatus(!!user, user?.uid || null, user?.name || null);

      if (!user?.uid) {
        setShowRedirecting(false);
        alert('You must be logged in to join a call.');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setShowRedirecting(false);
        alert(t('sessionExpired') || 'Your session has expired. Please log in again.');
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
      alert(message);
    }
  }, [appointments, isAppointmentPast, user, generateRoomCodeUseCase, updateAppointmentUseCase, setAuthStatus, t]);

  const upcomingCount = useMemo(() =>
    events.filter(e => {
      const end = e.end as Date | undefined;
      return end ? end > new Date() : false;
    }).length,
    [events]
  );

  if (loading && appointments.length === 0) return <Loader />;

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath={DASHBOARD_PATHS.root}>
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
          <Calendar events={events} onSelectEvent={handleSelectEvent} />
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
    </RoleGuard>
  );
}
