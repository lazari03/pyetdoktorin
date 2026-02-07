import { ClinicBooking, ClinicBookingInput, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';

export interface IClinicBookingRepository {
  createBooking(input: ClinicBookingInput): Promise<ClinicBooking>;
  getBookingsByClinic(clinicId: string): Promise<ClinicBooking[]>;
  getBookingsByPatient(patientId: string): Promise<ClinicBooking[]>;
  updateBookingStatus(bookingId: string, status: ClinicBookingStatus): Promise<void>;
}
