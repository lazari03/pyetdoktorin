import type { IAvailabilityService } from './ports/IAvailabilityService';
import type { DoctorAvailability } from '@/domain/entities/DoctorAvailability';

export class SaveAvailabilityUseCase {
  constructor(private service: IAvailabilityService) {}
  async execute(availability: Omit<DoctorAvailability, 'doctorId' | 'updatedAt'>): Promise<DoctorAvailability> {
    return this.service.saveMyAvailability(availability);
  }
}
