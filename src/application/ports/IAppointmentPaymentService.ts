export interface IAppointmentPaymentService {
  markPaymentProcessing(appointmentId: string): Promise<void>;
}
