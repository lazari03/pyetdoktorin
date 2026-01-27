import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class VerifyStripePaymentUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(appointmentId: string): Promise<void> {
    await this.appointmentService.verifyStripePayment(appointmentId);
  }
}
