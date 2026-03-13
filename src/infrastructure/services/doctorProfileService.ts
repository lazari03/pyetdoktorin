import { IDoctorProfileService } from '@/application/ports/IDoctorProfileService';
import { Doctor } from '@/domain/entities/Doctor';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';
import { getDoctorById } from '@/infrastructure/services/doctorService';

export class DoctorProfileService implements IDoctorProfileService {
  constructor(_userRepo: FirebaseUserRepository) {}

  async getDoctorById(id: string): Promise<Doctor | null> {
    return getDoctorById(id);
  }
}
