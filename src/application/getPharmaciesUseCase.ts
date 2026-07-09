import type { IPharmacyService, Pharmacy } from './ports/IPharmacyService';

export class GetPharmaciesUseCase {
  constructor(private pharmacyService: IPharmacyService) {}
  async execute(): Promise<Pharmacy[]> {
    return this.pharmacyService.listPharmacies();
  }
}
