import type { INotificationService } from '@/application/ports/INotificationService';
import type { Appointment } from '@/domain/entities/Appointment';
import { backendFetch } from '@/network/backendClient';

export class NotificationService implements INotificationService {
  async getUserRole(_userId: string): Promise<string | null> {
    return null;
  }

  async fetchAppointmentDetails(_appointments: Appointment[]): Promise<Array<{ id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }>> {
    return [];
  }

  async dismissNotification(appointmentId: string, userId: string): Promise<void> {
    await backendFetch(`/api/notifications/dismiss/${appointmentId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async dismissNotificationById(id: string): Promise<void> {
    await backendFetch(`/api/notifications/dismiss/${id}`, { method: 'POST' });
  }
}
