import { INotificationService } from '@/application/ports/INotificationService';
import { Appointment } from '@/domain/entities/Appointment';
import { getUserRole, fetchAppointmentDetails, dismissNotification } from '@/infrastructure/services/notificationService';

export class NotificationServiceAdapter implements INotificationService {
  async getUserRole(userId: string): Promise<string | null> {
    return getUserRole(userId);
  }

  async fetchAppointmentDetails(appointments: Appointment[]) {
    return fetchAppointmentDetails(appointments);
  }

  async dismissNotification(appointmentId: string, userId: string): Promise<void> {
    await dismissNotification(appointmentId, userId);
  }
}
