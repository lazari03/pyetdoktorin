export interface IPaymentGateway {
  startOrder(appointmentId: string): Promise<{ orderId: string; approvalUrl: string }>;
  captureOrder(orderId: string): Promise<{ status: string; appointmentId?: string }>;
}
