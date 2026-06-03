import type { IAppointmentPaymentService } from './ports/IAppointmentPaymentService';

export class ClearPaymentProcessingUseCase {
  constructor(private service: IAppointmentPaymentService) {}
  async execute(appointmentId: string): Promise<void> {
    return this.service.clearPaymentProcessing(appointmentId);
  }
}
