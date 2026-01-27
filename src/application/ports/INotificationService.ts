import { Appointment } from '@/domain/entities/Appointment';

export interface INotificationService {
  getUserRole(userId: string): Promise<string | null>;
  fetchAppointmentDetails(appointments: Appointment[]): Promise<Array<{ id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }>>;
  dismissNotification(appointmentId: string, userId: string): Promise<void>;
}
