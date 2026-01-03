import { apiClient } from './apiClient';

export async function verifyStripeSession(sessionId: string) {
  return apiClient.get<{ appointmentId: string }>(`/api/stripe/verify-payment?session_id=${sessionId}`);
}

export async function updateAppointmentStatus(appointmentId: string, isPaid: boolean) {
  return apiClient.post(`/api/appointments/update-status`, { appointmentId, isPaid });
}
