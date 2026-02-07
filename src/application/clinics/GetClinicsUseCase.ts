import { IClinicRepository } from '@/domain/repositories/IClinicRepository';
import { Clinic } from '@/domain/entities/Clinic';

export class GetClinicsUseCase {
  constructor(private clinicRepository: IClinicRepository) {}

  execute(): Promise<Clinic[]> {
    return this.clinicRepository.getClinics();
  }
}
