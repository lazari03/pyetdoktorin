export interface IPaymentCheckoutService {
  createCheckout(appointmentId: string): Promise<{ checkoutUrl: string }>;
}
