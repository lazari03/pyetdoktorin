import { IAppointmentPaymentService, PaymentSyncResult } from '@/application/ports/IAppointmentPaymentService';
import { markPaymentProcessing, clearPaymentProcessing } from '@/network/appointments';
import { syncPaddlePaymentWithRetry } from '@/network/payments';

export class AppointmentPaymentService implements IAppointmentPaymentService {
  async markPaymentProcessing(appointmentId: string): Promise<void> {
    await markPaymentProcessing(appointmentId);
  }

  async syncPaymentWithRetry(appointmentId: string): Promise<PaymentSyncResult> {
    return syncPaddlePaymentWithRetry(appointmentId);
  }

  async clearPaymentProcessing(appointmentId: string): Promise<void> {
    await clearPaymentProcessing(appointmentId);
  }
}
