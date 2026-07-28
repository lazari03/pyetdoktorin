import type { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';
import { createPolarCheckout } from '@/network/payments';

export class PolarCheckoutService implements IPaymentCheckoutService {
  async createCheckout(appointmentId: string): Promise<{ checkoutUrl: string }> {
    return createPolarCheckout(appointmentId);
  }
}
