import type { AppointmentStatus } from '@/domain/entities/AppointmentStatus';

export interface IAppointmentNotificationService {
  updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void>;
}
