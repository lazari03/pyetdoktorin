import type { IAuthService } from './ports/IAuthService';

export class GetIdTokenUseCase {
  constructor(private service: IAuthService) {}
  async execute(): Promise<string> {
    return this.service.getIdToken();
  }
}
