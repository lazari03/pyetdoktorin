import { IDoctorProfileService } from '@/application/ports/IDoctorProfileService';
import { Doctor } from '@/domain/entities/Doctor';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';

export class DoctorProfileService implements IDoctorProfileService {
  constructor(private userRepo: FirebaseUserRepository) {}

  async getDoctorById(id: string): Promise<Doctor | null> {
    const user = await this.userRepo.getById(id);
    if (!user || !user.name) return null;
    return {
      id: user.id,
      name: user.name,
      specialization: user.specialization ?? [],
      profilePicture: user.profilePicture,
    };
  }
}
