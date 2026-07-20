import { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';
import { renderPayPalButtons, preparePayPalCheckout } from '@/infrastructure/services/paypalCheckout';

export class PaymentCheckoutService implements IPaymentCheckoutService {
  async renderCheckout(params: {
    containerId: string;
    appointmentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }): Promise<void> {
    await renderPayPalButtons(params);
  }

  async prepareCheckout(): Promise<void> {
    await preparePayPalCheckout();
  }
}
