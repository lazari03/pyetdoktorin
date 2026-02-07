import { backendFetch } from './backendClient';

export interface PayPalOrderResponse {
  orderId: string;
  approvalUrl: string;
}

export async function createPayPalOrder(appointmentId: string) {
  return backendFetch<PayPalOrderResponse>('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ appointmentId }),
  });
}

export interface CaptureOrderResponse {
  status: string;
  appointmentId?: string;
}

export async function capturePayPalOrder(orderId: string, appointmentId: string) {
  return backendFetch<CaptureOrderResponse>('/api/payments/capture-order', {
    method: 'POST',
    body: JSON.stringify({ orderId, appointmentId }),
  });
}
