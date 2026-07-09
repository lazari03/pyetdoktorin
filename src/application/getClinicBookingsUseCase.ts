import type { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';
import type { ClinicBooking } from '@/domain/entities/ClinicBooking';

export class GetClinicBookingsUseCase {
  constructor(private clinicBookingRepo: IClinicBookingRepository) {}
  async execute(params: { clinicId?: string; patientId?: string }): Promise<ClinicBooking[]> {
    if (params.clinicId) {
      return this.clinicBookingRepo.getBookingsByClinic(params.clinicId);
    }
    if (params.patientId) {
      return this.clinicBookingRepo.getBookingsByPatient(params.patientId);
    }
    return [];
  }
}
