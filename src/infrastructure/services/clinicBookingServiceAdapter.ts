import type { IClinicBookingService } from '@/application/ports/IClinicBookingService';
import type { ClinicBooking, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { backendFetch } from '@/network/backendClient';

export class ClinicBookingServiceAdapter implements IClinicBookingService {
  async getBookings(filters?: { clinicId?: string; patientId?: string }): Promise<ClinicBooking[]> {
    const params = new URLSearchParams();
    if (filters?.clinicId) params.set('clinicId', filters.clinicId);
    if (filters?.patientId) params.set('patientId', filters.patientId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await backendFetch<{ items: ClinicBooking[] }>(`/api/clinics/bookings${query}`);
    return response.items;
  }

  async updateBookingStatus(id: string, status: ClinicBookingStatus): Promise<void> {
    await backendFetch(`/api/clinics/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}
