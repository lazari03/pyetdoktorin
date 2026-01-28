import { IAppointmentNotificationService } from '@/application/ports/IAppointmentNotificationService';

export class UpdateAppointmentStatusAndNotifyUseCase {
  constructor(private appointmentNotificationService: IAppointmentNotificationService) {}

  async execute(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void> {
    await this.appointmentNotificationService.updateAppointmentStatusAndNotify(appointmentId, action);
  }
}
