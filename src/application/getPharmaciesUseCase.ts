import { IPharmacyService, Pharmacy } from "./ports/IPharmacyService";

export class GetPharmaciesUseCase {
  constructor(private service: IPharmacyService) {}
  async execute(): Promise<Pharmacy[]> {
    return this.service.listPharmacies();
  }
}
