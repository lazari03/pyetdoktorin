import { useMemo } from 'react';
import { Appointment } from '../models/Appointment';
import { parseDateTime } from '../utils/dateFormatter';

export function useUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  return useMemo(() => {
    if (!appointments || appointments.length === 0) return null;
    const now = new Date();
    const upcoming = appointments
      .filter((a) => {
        const dateTime = parseDateTime(a.preferredDate, a.preferredTime);
        return dateTime > now && a.status === 'accepted';
      })
      .sort((a, b) => {
        const dateA = parseDateTime(a.preferredDate, a.preferredTime).getTime();
        const dateB = parseDateTime(b.preferredDate, b.preferredTime).getTime();
        return dateA - dateB;
      });
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);
}
