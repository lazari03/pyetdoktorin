import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";

export class CreateReciepeUseCase {
  constructor(private service: IReciepeService) {}
  async execute(payload: ReciepePayload): Promise<string> {
    return this.service.createReciepe(payload);
  }
}
