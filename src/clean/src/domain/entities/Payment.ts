export interface Money {
  amount: number;
  currency: string;
}

export class Payment {
  private constructor(
    public readonly id: string,
    public readonly appointmentId: string,
    public readonly userId: string,
    public readonly amount: Money,
    public readonly status: PaymentStatus,
    public readonly paymentMethod: PaymentMethod,
    public readonly transactionId?: string,
    public readonly createdAt: string,
    public readonly completedAt?: string
  ) {}

  static create(params: {
    id: string;
    appointmentId: string;
    userId: string;
    amount: Money;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    createdAt: string;
    completedAt?: string;
  }): Payment {
    return new Payment(
      params.id,
      params.appointmentId,
      params.userId,
      params.amount,
      params.status,
      params.paymentMethod,
      params.transactionId,
      params.createdAt,
      params.completedAt
    );
  }

  static createPending(params: {
    id: string;
    appointmentId: string;
    userId: string;
    amount: Money;
    paymentMethod: PaymentMethod;
  }): Payment {
    return Payment.create({
      ...params,
      status: PaymentStatus.PENDING,
      createdAt: new Date().toISOString()
    });
  }

  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  complete(transactionId: string): Payment {
    return Payment.create({
      ...this,
      status: PaymentStatus.COMPLETED,
      transactionId,
      completedAt: new Date().toISOString()
    });
  }

  fail(): Payment {
    return Payment.create({
      ...this,
      status: PaymentStatus.FAILED
    });
  }
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  CASH = 'cash'
}