import { openPaddleCheckout } from '@/infrastructure/services/paddleCheckout';

export class HandlePayNowUseCase {
  constructor() {}

  async execute(appointmentId: string, _amount?: number): Promise<void> {
    if (!appointmentId) {
      alert('Missing appointment id.');
      return;
    }
    try {
      await openPaddleCheckout({ appointmentId });
    } catch (error) {
      console.error('Failed to open Paddle checkout', error);
      alert('Unable to start the payment. Please try again.');
    }
  }
}
