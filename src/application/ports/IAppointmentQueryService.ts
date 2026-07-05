import type { Appointment } from '@/domain/entities/Appointment';

export interface IAppointmentQueryService {
  listAppointments(): Promise<{ items: Appointment[] }>;
}
