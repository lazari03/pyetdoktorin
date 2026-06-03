import type { IAvailabilityService } from './ports/IAvailabilityService';
import type { ResolvedTimeSlot } from '@/domain/entities/DoctorAvailability';

export class GetResolvedSlotsUseCase {
  constructor(private service: IAvailabilityService) {}
  async execute(doctorId: string, date: string): Promise<ResolvedTimeSlot[]> {
    return this.service.getResolvedSlots(doctorId, date);
  }
}
