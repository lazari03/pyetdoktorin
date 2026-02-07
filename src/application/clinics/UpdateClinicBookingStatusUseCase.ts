import { ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';

export class UpdateClinicBookingStatusUseCase {
  constructor(private clinicBookingRepository: IClinicBookingRepository) {}

  execute(bookingId: string, status: ClinicBookingStatus): Promise<void> {
    return this.clinicBookingRepository.updateBookingStatus(bookingId, status);
  }
}
