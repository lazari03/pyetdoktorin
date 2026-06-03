import type { IPharmacyService, Pharmacy } from '@/application/ports/IPharmacyService';
import { fetchAdminUsers } from '@/network/adminUsers';
import { UserRole } from '@/domain/entities/UserRole';

export class PharmacyService implements IPharmacyService {
  async listPharmacies(): Promise<Pharmacy[]> {
    const response = await fetchAdminUsers({ role: UserRole.Pharmacy, pageSize: 200 });
    return (response.items || []).map((entry: Record<string, unknown>) => ({
      id: String(entry.id ?? ''),
      name:
        (entry.pharmacyName as string | undefined) ||
        `${(entry.name as string | undefined) ?? ''} ${(entry.surname as string | undefined) ?? ''}`.trim() ||
        'Pharmacy',
    }));
  }
}
