import type { IPaymentCheckoutService } from './ports/IPaymentCheckoutService';

export class PrepareCheckoutUseCase {
  constructor(private service: IPaymentCheckoutService) {}
  async execute(): Promise<void> {
    return this.service.prepareCheckout();
  }
}
