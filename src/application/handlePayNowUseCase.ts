import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class HandlePayNowUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(appointmentId: string, amount: number): Promise<void> {
    await this.appointmentService.handlePayNow(appointmentId, amount);
  }
}
