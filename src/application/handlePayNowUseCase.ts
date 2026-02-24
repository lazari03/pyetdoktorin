import { openPaddleCheckout } from '@/infrastructure/services/paddleCheckout';
import { markPaymentProcessing } from '@/network/appointments';
import { getAppointmentErrorMessage } from '@/presentation/utils/errorMessages';
import i18n from '@/i18n/i18n';

export class HandlePayNowUseCase {
  constructor() {}

  async execute(
    appointmentId: string,
    _amount?: number,
    options?: { onClose?: () => void }
  ): Promise<void> {
    if (!appointmentId) {
      alert('Missing appointment id.');
      return;
    }
    try {
      await markPaymentProcessing(appointmentId);
      await openPaddleCheckout({ appointmentId, onClose: options?.onClose });
    } catch (error) {
      console.error('Failed to open Paddle checkout', error);
      const message = getAppointmentErrorMessage(error, i18n.t.bind(i18n));
      alert(message ?? 'Unable to start the payment. Please try again.');
    }
  }
}
