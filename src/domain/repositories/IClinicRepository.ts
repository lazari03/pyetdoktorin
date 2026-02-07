import { Clinic } from '@/domain/entities/Clinic';

export interface IClinicRepository {
  getClinics(): Promise<Clinic[]>;
}
