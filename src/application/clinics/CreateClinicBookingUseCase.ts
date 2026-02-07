import { ClinicBooking, ClinicBookingInput } from '@/domain/entities/ClinicBooking';
import { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';

export class CreateClinicBookingUseCase {
  constructor(private clinicBookingRepository: IClinicBookingRepository) {}

  execute(input: ClinicBookingInput): Promise<ClinicBooking> {
    return this.clinicBookingRepository.createBooking(input);
  }
}
