import { backendFetch } from '@/network/backendClient';
import type { QuickAppointmentQuery, QuickAppointmentResponse } from '@/domain/entities/QuickAppointment';

export async function getQuickAppointmentMatches(query: QuickAppointmentQuery): Promise<QuickAppointmentResponse> {
  const params = new URLSearchParams();
  if (query.specialty) params.set('specialty', query.specialty);
  if (query.preferredDate) params.set('preferredDate', query.preferredDate);
  if (query.preferredTime) params.set('preferredTime', query.preferredTime);
  if (typeof query.limit === 'number') params.set('limit', String(query.limit));

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return backendFetch<QuickAppointmentResponse>(`/api/appointments/quick-match${suffix}`);
}