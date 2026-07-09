import type { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';
import type { ClinicBooking, ClinicBookingInput, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { backendFetch } from '@/network/backendClient';

export class ClinicBookingRepository implements IClinicBookingRepository {
  async createBooking(input: ClinicBookingInput): Promise<ClinicBooking> {
    return backendFetch<ClinicBooking>('/api/clinics/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getBookingsByClinic(clinicId: string): Promise<ClinicBooking[]> {
    const res = await backendFetch<{ items: ClinicBooking[] }>(`/api/clinics/bookings?clinicId=${clinicId}`);
    return res.items;
  }

  async getBookingsByPatient(patientId: string): Promise<ClinicBooking[]> {
    const res = await backendFetch<{ items: ClinicBooking[] }>(`/api/clinics/bookings?patientId=${patientId}`);
    return res.items;
  }

  async updateBookingStatus(bookingId: string, status: ClinicBookingStatus): Promise<void> {
    await backendFetch(`/api/clinics/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}
