import { INotificationService } from '@/application/ports/INotificationService';
import { Appointment } from '@/domain/entities/Appointment';

export class FetchAppointmentDetailsUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(appointments: Appointment[]) {
    return this.notificationService.fetchAppointmentDetails(appointments);
  }
}
