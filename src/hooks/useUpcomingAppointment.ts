import { useMemo } from 'react';
import { Appointment } from '../models/Appointment';

export function useUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  return useMemo(() => {
    if (!appointments || appointments.length === 0) return null;
    const now = new Date();
    const upcoming = appointments
      .filter((a) => {
        const dateTime = new Date(`${a.preferredDate}T${a.preferredTime}`);
        return dateTime > now && a.status === 'accepted';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`).getTime();
        const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`).getTime();
        return dateA - dateB;
      });
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);
}
