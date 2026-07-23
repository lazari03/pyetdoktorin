import { IAppointmentPaymentService } from '@/application/ports/IAppointmentPaymentService';
import { IPaymentCheckoutService } from '@/application/ports/IPaymentCheckoutService';

export class HandlePayNowUseCase {
  constructor(
    private readonly paymentService: IAppointmentPaymentService,
    private readonly checkoutService: IPaymentCheckoutService
  ) {}

  async execute(
    appointmentId: string,
    _amount?: number,
    options?: { onClose?: () => void }
  ): Promise<void> {
    if (!appointmentId) {
      throw new Error('Missing appointment id');
    }
    await this.paymentService.markPaymentProcessing(appointmentId);
    await this.checkoutService.openCheckout({ appointmentId, onClose: options?.onClose });
  }
}
