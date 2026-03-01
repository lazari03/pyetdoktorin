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

function normalizeAppointment(input: Appointment): Appointment {
  const createdAt = (input as unknown as { createdAt?: unknown }).createdAt;
  const createdAtIso =
    typeof createdAt === 'number'
      ? new Date(createdAt).toISOString()
      : typeof createdAt === 'string'
        ? createdAt
        : new Date().toISOString();
  const notes = (input as unknown as { notes?: unknown; note?: unknown }).notes;
  const note = (input as unknown as { note?: unknown }).note;
  return {
    ...input,
    createdAt: createdAtIso,
    notes: (typeof notes === 'string' ? notes : typeof note === 'string' ? note : input.notes) ?? '',
  };
}

export async function listAppointments() {
  const res = await backendFetch<AppointmentListResponse>('/api/appointments');
  return { items: res.items.map(normalizeAppointment) };
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const res = await backendFetch<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAppointment(res);
}

export async function getAppointment(id: string) {
  const res = await backendFetch<Appointment>(`/api/appointments/${id}`);
  return normalizeAppointment(res);
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
