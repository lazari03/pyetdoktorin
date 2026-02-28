export interface IPaymentCheckoutService {
  openCheckout(params: { appointmentId: string; onClose?: () => void }): Promise<void>;
}
