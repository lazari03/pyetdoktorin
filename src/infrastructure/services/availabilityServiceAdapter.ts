import type { IAvailabilityService } from '@/application/ports/IAvailabilityService';
import type {
  AvailabilityPreset,
  DoctorAvailability,
  ResolvedTimeSlot,
} from '@/domain/entities/DoctorAvailability';
import {
  getAvailabilityPresets,
  getMyAvailability,
  getResolvedAvailabilitySlots,
  saveMyAvailability,
} from '@/network/availability';

export class AvailabilityServiceAdapter implements IAvailabilityService {
  async getMyAvailability(): Promise<DoctorAvailability> {
    return getMyAvailability();
  }

  async getPresets(): Promise<AvailabilityPreset[]> {
    return getAvailabilityPresets();
  }

  async saveMyAvailability(
    availability: Omit<DoctorAvailability, 'doctorId' | 'updatedAt'>,
  ): Promise<DoctorAvailability> {
    return saveMyAvailability(availability);
  }

  async getResolvedSlots(doctorId: string, date: string): Promise<ResolvedTimeSlot[]> {
    return getResolvedAvailabilitySlots(doctorId, date);
  }
}

export const availabilityService = new AvailabilityServiceAdapter();
