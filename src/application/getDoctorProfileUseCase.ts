import { IDoctorProfileService } from '@/application/ports/IDoctorProfileService';
import { Doctor } from '@/domain/entities/Doctor';

export class GetDoctorProfileUseCase {
  constructor(private doctorProfileService: IDoctorProfileService) {}

  async execute(id: string): Promise<Doctor | null> {
    return this.doctorProfileService.getDoctorById(id);
  }
}
