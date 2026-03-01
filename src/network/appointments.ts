import { backendFetch } from './backendClient';
import type { Appointment } from '@/domain/entities/Appointment';
import type { AppointmentStatus } from '@/domain/entities/AppointmentStatus';

export interface AppointmentListResponse {
  items: Appointment[];
}

export interface CreateAppointmentPayload {
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  preferredDate: string;
  preferredTime?: string;
  note?: string;
}

export async function listAppointments() {
  return backendFetch<AppointmentListResponse>('/api/appointments');
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  return backendFetch<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAppointment(id: string) {
  return backendFetch<Appointment>(`/api/appointments/${id}`);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return backendFetch(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function markPaymentProcessing(id: string) {
  return backendFetch<{ ok: boolean }>(`/api/appointments/${id}/payment-started`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function clearPaymentProcessing(id: string) {
  return backendFetch<{ ok: boolean }>(`/api/appointments/${id}/payment-cancelled`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
