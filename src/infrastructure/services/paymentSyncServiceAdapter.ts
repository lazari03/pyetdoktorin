import type { IPaymentSyncService } from '@/application/ports/IPaymentSyncService';
import { syncPaddlePayment, syncPaddlePaymentWithRetry } from '@/network/payments';
import { clearPaymentProcessing } from '@/network/appointments';

export class PaymentSyncServiceAdapter implements IPaymentSyncService {
  async syncPayment(appointmentId: string): Promise<void> {
    await syncPaddlePayment(appointmentId);
  }

  async syncPaymentWithRetry(appointmentId: string): Promise<void> {
    await syncPaddlePaymentWithRetry(appointmentId);
  }

  async clearPaymentProcessing(appointmentId: string): Promise<void> {
    await clearPaymentProcessing(appointmentId);
  }
}
