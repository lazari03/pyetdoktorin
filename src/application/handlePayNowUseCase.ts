import { IAppointmentPaymentService } from '@/application/ports/IAppointmentPaymentService';

export class HandlePayNowUseCase {
  constructor(private readonly paymentService: IAppointmentPaymentService) {}

  async execute(appointmentId: string): Promise<void> {
    if (!appointmentId) {
      throw new Error('Missing appointment id');
    }
    await this.paymentService.markPaymentProcessing(appointmentId);
  }
}
