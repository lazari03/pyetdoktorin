import type { IAuthService } from './ports/IAuthService';

export class EstablishSessionUseCase {
  constructor(private service: IAuthService) {}
  async execute(): Promise<void> {
    return this.service.establishSession();
  }
}
