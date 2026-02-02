import { apiClient } from './apiClient';

export function createPayPalOrder(appointmentId: string, patientId?: string) {
  return apiClient.post<{ orderId: string; approvalUrl: string }>(
    '/api/paypal/create-order',
    { appointmentId, patientId }
  );
}

export function capturePayPalOrder(orderId: string) {
  return apiClient.post<{ ok: boolean; result: { status: string; appointmentId?: string } }>(
    '/api/paypal/capture-order',
    { orderId }
  );
}
