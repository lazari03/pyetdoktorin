import { Doctor } from '@/domain/entities/Doctor';

export interface IDoctorProfileService {
  getDoctorById(id: string): Promise<Doctor | null>;
}
