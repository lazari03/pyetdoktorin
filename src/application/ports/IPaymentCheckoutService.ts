export interface IPaymentCheckoutService {
  renderCheckout(params: {
    containerId: string;
    appointmentId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }): Promise<void>;
  prepareCheckout(): Promise<void>;
}
