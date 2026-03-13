import { backendFetch } from '@/network/backendClient';
import type { DoctorAvailability, ResolvedTimeSlot } from '@/domain/entities/DoctorAvailability';

export async function getMyAvailability(): Promise<DoctorAvailability> {
  return backendFetch<DoctorAvailability>('/api/availability/me');
}

export async function saveMyAvailability(
  availability: Omit<DoctorAvailability, 'doctorId' | 'updatedAt'>,
): Promise<DoctorAvailability> {
  return backendFetch<DoctorAvailability>('/api/availability/me', {
    method: 'PUT',
    body: JSON.stringify(availability),
  });
}

export async function getResolvedAvailabilitySlots(
  doctorId: string,
  date: string,
): Promise<ResolvedTimeSlot[]> {
  const params = new URLSearchParams({ date });
  const response = await backendFetch<{ items: ResolvedTimeSlot[] }>(
    `/api/availability/${encodeURIComponent(doctorId)}/slots?${params.toString()}`,
  );
  return response.items;
}
