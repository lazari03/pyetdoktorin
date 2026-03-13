import type { DoctorAvailability, ResolvedTimeSlot } from '@/domain/entities/DoctorAvailability';

export interface IAvailabilityService {
  getMyAvailability(): Promise<DoctorAvailability>;
  saveMyAvailability(availability: Omit<DoctorAvailability, 'doctorId' | 'updatedAt'>): Promise<DoctorAvailability>;
  getResolvedSlots(doctorId: string, date: string): Promise<ResolvedTimeSlot[]>;
}
