import { apiClient } from './apiClient';

export function createPayPalOrder(appointmentId: string) {
  return apiClient.post<{ orderId: string; approvalUrl: string }>(
    '/api/paypal/create-order',
    { appointmentId }
  );
}

export function capturePayPalOrder(orderId: string) {
  return apiClient.post<{ ok: boolean; result: { status: string; appointmentId?: string } }>(
    '/api/paypal/capture-order',
    { orderId }
  );
}
