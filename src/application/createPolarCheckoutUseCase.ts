import type { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';

export class CreatePolarCheckoutUseCase {
  constructor(private paymentCheckoutService: IPaymentCheckoutService) {}

  async execute(appointmentId: string): Promise<{ checkoutUrl: string }> {
    return this.paymentCheckoutService.createCheckout(appointmentId);
  }
}
