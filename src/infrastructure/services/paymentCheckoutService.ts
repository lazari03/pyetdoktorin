import { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';
import { openPaddleCheckout } from '@/infrastructure/services/paddleCheckout';

export class PaymentCheckoutService implements IPaymentCheckoutService {
  async openCheckout(params: { appointmentId: string; onClose?: () => void }): Promise<void> {
    await openPaddleCheckout(params);
  }
}
