import type { IAppointmentNotificationService } from './ports/IAppointmentNotificationService';

export class UpdateAppointmentStatusAndNotifyUseCase {
  constructor(private appointmentNotificationService: IAppointmentNotificationService) {}
  async execute(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void> {
    return this.appointmentNotificationService.updateAppointmentStatusAndNotify(appointmentId, action);
  }
}
