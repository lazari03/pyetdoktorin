import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class SetAppointmentPaidUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(appointmentId: string): Promise<void> {
    await this.appointmentService.setAppointmentPaid(appointmentId);
  }
}
