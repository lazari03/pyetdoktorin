import { Appointment } from '@/domain/entities/Appointment';

export function sortAppointments(appointments: Appointment[], maxRows: number): Appointment[] {
  return [...appointments]
    .sort((a, b) => {
      const dateDiff = new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime();
      return dateDiff || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, maxRows);
}
