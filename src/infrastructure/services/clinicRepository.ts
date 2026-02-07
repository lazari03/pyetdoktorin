import { clinicsCatalog } from '@/data/clinics';
import { IClinicRepository } from '@/domain/repositories/IClinicRepository';
import { Clinic } from '@/domain/entities/Clinic';

export class StaticClinicRepository implements IClinicRepository {
  async getClinics(): Promise<Clinic[]> {
    return clinicsCatalog;
  }
}
