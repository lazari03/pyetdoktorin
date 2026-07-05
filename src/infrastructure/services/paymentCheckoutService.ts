import { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';
import { openPaddleCheckout, preparePaddleCheckout } from '@/infrastructure/services/paddleCheckout';

export class PaymentCheckoutService implements IPaymentCheckoutService {
  async openCheckout(params: { appointmentId: string; onClose?: () => void }): Promise<void> {
    await openPaddleCheckout(params);
  }

  async prepare(): Promise<void> {
    await preparePaddleCheckout();
  }
}
