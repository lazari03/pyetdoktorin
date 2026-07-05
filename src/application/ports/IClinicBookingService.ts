import type { ClinicBooking, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';

export interface IClinicBookingService {
  getBookings(filters?: { clinicId?: string; patientId?: string }): Promise<ClinicBooking[]>;
  updateBookingStatus(id: string, status: ClinicBookingStatus): Promise<void>;
}
