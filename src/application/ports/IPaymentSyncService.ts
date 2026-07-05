export interface IPaymentSyncService {
  syncPayment(appointmentId: string): Promise<void>;
  syncPaymentWithRetry(appointmentId: string): Promise<void>;
  clearPaymentProcessing(appointmentId: string): Promise<void>;
}
