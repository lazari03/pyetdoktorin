import { IDoctorProfileService } from '@/application/ports/IDoctorProfileService';
import { Doctor } from '@/domain/entities/Doctor';
import { getDoctorById } from '@/infrastructure/services/doctorService';

export class DoctorProfileService implements IDoctorProfileService {
  async getDoctorById(id: string): Promise<Doctor | null> {
    return getDoctorById(id);
  }
}
