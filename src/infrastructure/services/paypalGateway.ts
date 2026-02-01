import { IPaymentGateway } from '@/application/ports/IPaymentGateway';
import { createPayPalOrder, capturePayPalOrder } from '@/network/paypalApiClient';

export class PayPalGateway implements IPaymentGateway {
  async startOrder(appointmentId: string): Promise<{ orderId: string; approvalUrl: string }> {
    const { data } = await createPayPalOrder(appointmentId);
    return data;
  }

  async captureOrder(orderId: string): Promise<{ status: string; appointmentId?: string }> {
    const { data } = await capturePayPalOrder(orderId);
    return data.result;
  }
}
