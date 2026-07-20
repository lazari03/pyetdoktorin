import type { IPaymentCheckoutService } from './ports/IPaymentCheckoutService';

export class OpenCheckoutUseCase {
  constructor(private service: IPaymentCheckoutService) {}
  async execute(params: {
    containerId: string;
    appointmentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }): Promise<void> {
    return this.service.renderCheckout(params);
  }
}
