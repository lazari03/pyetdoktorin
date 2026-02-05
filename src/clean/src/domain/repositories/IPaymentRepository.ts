import { Payment, PaymentStatus, PaymentMethod } from '../entities/Payment';

export interface IPaymentRepository {
  // Basic CRUD operations
  getById(id: string): Promise<Payment | null>;
  create(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  update(id: string, updates: Partial<Payment>): Promise<Payment>;
  delete(id: string): Promise<void>;

  // User-specific queries
  getUserPayments(userId: string): Promise<Payment[]>;
  getPendingPayments(userId: string): Promise<Payment[]>;
  getCompletedPayments(userId: string): Promise<Payment[]>;

  // Appointment-specific queries
  getPaymentByAppointment(appointmentId: string): Promise<Payment | null>;
  createPaymentForAppointment(
    appointmentId: string,
    userId: string,
    amount: { amount: number; currency: string },
    paymentMethod: PaymentMethod
  ): Promise<Payment>;

  // Status operations
  completePayment(paymentId: string, transactionId: string): Promise<Payment>;
  failPayment(paymentId: string): Promise<Payment>;
  refundPayment(paymentId: string): Promise<Payment>;

  // Method-specific queries
  getPaymentsByMethod(method: PaymentMethod): Promise<Payment[]>;
  
  // Search and filtering
  findByDateRange(userId: string, startDate: string, endDate: string): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;

  // Batch operations
  updateMultiple(updates: { id: string; changes: Partial<Payment> }[]): Promise<Payment[]>;

  // Admin operations
  getAllPayments(limit?: number, offset?: number): Promise<Payment[]>;
  getPaymentStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalRevenue: number;
  }>;

  // Transaction tracking
  getByTransactionId(transactionId: string): Promise<Payment | null>;
}