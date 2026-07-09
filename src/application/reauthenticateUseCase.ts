import type { IAuthService } from './ports/IAuthService';

export class ReauthenticateUseCase {
  constructor(private service: IAuthService) {}
  async execute(password: string): Promise<void> {
    return this.service.reauthenticate(password);
  }
}
