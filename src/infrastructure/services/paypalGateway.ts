import { IPaymentGateway } from '@/application/ports/IPaymentGateway';
import { createPayPalOrder, capturePayPalOrder } from '@/network/paypalApiClient';

export class PayPalGateway implements IPaymentGateway {
  async startOrder(appointmentId: string): Promise<{ orderId: string; approvalUrl: string }> {
    return createPayPalOrder(appointmentId);
  }

  async captureOrder(orderId: string, appointmentId: string): Promise<{ status: string; appointmentId?: string }> {
    return capturePayPalOrder(orderId, appointmentId);
  }
}
