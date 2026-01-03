import { apiClient } from "./apiClient";

export async function createPaymentIntent(appointmentId: string, amount: number) {
  return apiClient.post<{ url?: string }>(
    "/api/stripe/create-payment-intent",
    { appointmentId, amount }
  );
}

export async function verifyPayment(appointmentId: string) {
  return apiClient.get<{ isPaid: boolean }>(
    `/api/stripe/verify-payment?appointmentId=${appointmentId}`
  );
}
