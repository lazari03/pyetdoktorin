import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";

export class GetReciepesByPharmacyUseCase {
  constructor(private service: IReciepeService) {}
  async execute(pharmacyId: string): Promise<ReciepePayload[]> {
    return this.service.listByPharmacy(pharmacyId);
  }
}
