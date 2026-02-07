import { ClinicBooking } from '@/domain/entities/ClinicBooking';
import { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';

interface Params {
  clinicId?: string;
  patientId?: string;
}

export class GetClinicBookingsUseCase {
  constructor(private clinicBookingRepository: IClinicBookingRepository) {}

  execute({ clinicId, patientId }: Params): Promise<ClinicBooking[]> {
    if (clinicId) {
      return this.clinicBookingRepository.getBookingsByClinic(clinicId);
    }
    if (patientId) {
      return this.clinicBookingRepository.getBookingsByPatient(patientId);
    }
    return Promise.resolve([]);
  }
}
