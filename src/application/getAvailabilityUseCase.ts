import type { IAvailabilityService } from './ports/IAvailabilityService';
import type { DoctorAvailability } from '@/domain/entities/DoctorAvailability';

export class GetAvailabilityUseCase {
  constructor(private service: IAvailabilityService) {}
  async execute(): Promise<DoctorAvailability> {
    return this.service.getMyAvailability();
  }
}
