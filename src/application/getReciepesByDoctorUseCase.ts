import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";

export class GetReciepesByDoctorUseCase {
  constructor(private service: IReciepeService) {}

  async execute(doctorId: string): Promise<ReciepePayload[]> {
    return this.service.listByDoctor(doctorId);
  }
}
