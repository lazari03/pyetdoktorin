export interface PaymentSyncResult {
  ok: boolean;
  updated?: boolean;
  isPaid?: boolean;
}

export interface IAppointmentPaymentService {
  markPaymentProcessing(appointmentId: string): Promise<void>;
  syncPaymentWithRetry(appointmentId: string): Promise<PaymentSyncResult>;
  clearPaymentProcessing(appointmentId: string): Promise<void>;
}
