import { IAppointmentPaymentService } from '@/application/ports/IAppointmentPaymentService';
import { markPaymentProcessing } from '@/network/appointments';

export class AppointmentPaymentService implements IAppointmentPaymentService {
  async markPaymentProcessing(appointmentId: string): Promise<void> {
    await markPaymentProcessing(appointmentId);
  }
}
