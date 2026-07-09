import type { IClinicRepository } from '@/domain/repositories/IClinicRepository';
import type { Clinic } from '@/domain/entities/Clinic';

export class GetClinicsUseCase {
  constructor(private clinicRepo: IClinicRepository) {}
  async execute(): Promise<Clinic[]> {
    return this.clinicRepo.getClinics();
  }
}
