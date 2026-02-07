export interface IDoctorPayoutService {
  recordPayout(appointmentId: string, doctorId: string, totalAmount: number): Promise<void>;
  getPayoutStatus(appointmentId: string): Promise<PayoutRecord | null>;
  listPendingPayouts(doctorId?: string): Promise<PayoutRecord[]>;
}

export interface PayoutRecord {
  id?: string;
  appointmentId: string;
  doctorId: string;
  totalAmount: number;
  payoutAmount: number;
  platformFee: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
}
