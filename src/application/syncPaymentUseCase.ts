import type { IAppointmentPaymentService, PaymentSyncResult } from './ports/IAppointmentPaymentService';

export class SyncPaymentUseCase {
  constructor(private service: IAppointmentPaymentService) {}
  async execute(appointmentId: string): Promise<PaymentSyncResult> {
    return this.service.syncPaymentWithRetry(appointmentId);
  }
}
