import type { IAuthService } from './ports/IAuthService';

export class EstablishSessionAllowUnverifiedUseCase {
  constructor(private service: IAuthService) {}
  async execute(): Promise<void> {
    return this.service.establishSessionAllowUnverified();
  }
}
