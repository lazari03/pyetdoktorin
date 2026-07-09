export interface IPaymentCheckoutService {
  openCheckout(params: { appointmentId: string; userId?: string | null; onClose?: () => void }): Promise<void>;
  prepareCheckout(): Promise<void>;
}
