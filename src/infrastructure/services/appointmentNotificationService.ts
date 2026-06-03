import type { IAppointmentNotificationService } from '@/application/ports/IAppointmentNotificationService';
import { updateAppointmentStatus } from '@/network/appointments';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';

export class AppointmentNotificationService implements IAppointmentNotificationService {
  async updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void> {
    const status = action === 'accepted' ? AppointmentStatus.Accepted : AppointmentStatus.Rejected;
    await updateAppointmentStatus(appointmentId, status);
  }
}
