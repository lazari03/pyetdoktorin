import type { IAvailabilityService } from './ports/IAvailabilityService';
import type { AvailabilityPreset } from '@/domain/entities/DoctorAvailability';

export class GetAvailabilityPresetsUseCase {
  constructor(private service: IAvailabilityService) {}
  async execute(): Promise<AvailabilityPreset[]> {
    return this.service.getPresets();
  }
}
