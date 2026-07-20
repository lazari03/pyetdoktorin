import type { IPaymentSyncService } from '@/application/ports/IPaymentSyncService';
import { syncPayment, syncPaymentWithRetry } from '@/network/payments';
import { clearPaymentProcessing } from '@/network/appointments';

export class PaymentSyncServiceAdapter implements IPaymentSyncService {
  async syncPayment(appointmentId: string): Promise<void> {
    await syncPayment(appointmentId);
  }

  async syncPaymentWithRetry(appointmentId: string): Promise<void> {
    await syncPaymentWithRetry(appointmentId);
  }

  async clearPaymentProcessing(appointmentId: string): Promise<void> {
    await clearPaymentProcessing(appointmentId);
  }
}
