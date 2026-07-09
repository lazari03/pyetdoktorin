import type { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';
import type { ClinicBooking, ClinicBookingInput } from '@/domain/entities/ClinicBooking';

export class CreateClinicBookingUseCase {
  constructor(private clinicBookingRepo: IClinicBookingRepository) {}
  async execute(input: ClinicBookingInput): Promise<ClinicBooking> {
    return this.clinicBookingRepo.createBooking(input);
  }
}
