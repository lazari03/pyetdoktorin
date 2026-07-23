export interface IAppointmentNotificationService {
  updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void>;
}
