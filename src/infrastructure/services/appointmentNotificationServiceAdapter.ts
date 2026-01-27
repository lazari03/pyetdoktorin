import { IAppointmentNotificationService } from '@/application/ports/IAppointmentNotificationService';
import { updateAppointmentStatusAndNotify } from '@/infrastructure/services/appointmentNotificationService';

export class AppointmentNotificationServiceAdapter implements IAppointmentNotificationService {
  async updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void> {
    await updateAppointmentStatusAndNotify(appointmentId, action);
  }
}
