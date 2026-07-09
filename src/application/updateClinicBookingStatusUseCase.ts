import type { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';
import type { ClinicBookingStatus } from '@/domain/entities/ClinicBooking';

export class UpdateClinicBookingStatusUseCase {
  constructor(private clinicBookingRepo: IClinicBookingRepository) {}
  async execute(bookingId: string, status: ClinicBookingStatus): Promise<void> {
    return this.clinicBookingRepo.updateBookingStatus(bookingId, status);
  }
}
