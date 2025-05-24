'use client';

import { useState, useEffect, useContext } from 'react';
import RoleGuard from '../../../components/RoleGuard';
import { UserRole } from '../../../../models/UserRole';
import Calendar from '../Calendar';
import Loader from '../../../components/Loader';
import { AuthContext } from '../../../../context/AuthContext';
import { fetchAppointments } from '../../../../services/appointmentsService';
import { Event as RBCEvent } from 'react-big-calendar';

export default function DoctorCalendarPage() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<RBCEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.uid) {
          // Fetch only appointments for this doctor
          const appointments = await fetchAppointments(user.uid, true); // true = isDoctor
          // Map appointments to calendar events
          const mappedEvents = appointments
            .filter(app => app.preferredDate && app.preferredTime)
            .map(app => {
              // Combine date and time into a Date object
              const start = new Date(`${app.preferredDate}T${app.preferredTime}`);
              // Example: 30 min duration
              const end = new Date(start.getTime() + 30 * 60 * 1000);
              return {
                title: `${app.appointmentType || 'Appointment'}${app.patientName ? ` with ${app.patientName}` : ''}`,
                start,
                end,
                resource: app, // pass the whole appointment as resource for extra info
              };
            });
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error('Error loading calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath="/dashboard">
      <div>
        <h1 className="text-2xl font-bold">Doctor&apos;s Calendar</h1>
        <Calendar events={events} />
      </div>
    </RoleGuard>
  );
}
