import { IReciepeService } from "./ports/IReciepeService";

export class UpdateReciepeStatusUseCase {
  constructor(private service: IReciepeService) {}
  async execute(id: string, status: "accepted" | "rejected") {
    return this.service.updateStatus(id, status);
  }
}
