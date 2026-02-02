import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";

export class GetReciepesByPatientUseCase {
  constructor(private service: IReciepeService) {}
  async execute(patientId: string): Promise<ReciepePayload[]> {
    return this.service.listByPatient(patientId);
  }
}
