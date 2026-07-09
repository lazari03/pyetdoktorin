import type { IClinicRepository } from '@/domain/repositories/IClinicRepository';
import type { Clinic } from '@/domain/entities/Clinic';
import { backendFetch } from '@/network/backendClient';

export class BackendClinicRepository implements IClinicRepository {
  async getClinics(): Promise<Clinic[]> {
    const res = await backendFetch<{ items: Clinic[] }>('/api/clinics/private', { method: 'GET' });
    return res.items;
  }
}
