'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import { UserRole } from '@/domain/entities/UserRole';
import Calendar from '../Calendar';
import Loader from '@/presentation/components/Loader/Loader';
import { useAuth } from '../../../../context/AuthContext';
import { useAppointmentStore } from '../../../../store/appointmentStore';
import { Event as RBCEvent } from 'react-big-calendar';

export default function DoctorCalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  const [events, setEvents] = useState<RBCEvent[]>([]);

  useEffect(() => {
    if (!user?.role) return;
    fetchAppointments(user.role);
  }, [user?.role, fetchAppointments]);

  useEffect(() => {
    // Map appointments to calendar events whenever appointments change
    const mappedEvents = appointments
      .filter(app => app.preferredDate && app.preferredTime)
      .map(app => {
        const start = new Date(`${app.preferredDate}T${app.preferredTime}`);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          title: `${app.appointmentType || t('appointment')}${app.patientName ? ` ${t('with')} ${app.patientName}` : ''}`,
          start,
          end,
          resource: app,
        };
      });
    setEvents(mappedEvents);
  }, [appointments, t]);

  if (loading) {
    return <Loader />;
  }

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath="/dashboard">
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
                {t('doctorCalendar')}
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
                {events.length}
              </p>
            </div>
          </header>
          <Calendar events={events} />
        </div>
      </div>
    </RoleGuard>
  );
}
