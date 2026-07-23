import type { IPaymentCheckoutService } from './ports/IPaymentCheckoutService';

export class OpenCheckoutUseCase {
  constructor(private service: IPaymentCheckoutService) {}
  async execute(params: { appointmentId: string; userId?: string | null; onClose?: () => void }): Promise<void> {
    return this.service.openCheckout(params);
  }
}
