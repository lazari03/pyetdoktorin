import { IPaymentGateway } from '@/application/ports/IPaymentGateway';

export class CapturePaywallPaymentUseCase {
  constructor(private gateway: IPaymentGateway) {}

  async execute(orderId: string): Promise<{ status: string; appointmentId?: string }> {
    return this.gateway.captureOrder(orderId);
  }
}
