import type { IAuthService } from './ports/IAuthService';

export class ReloadUserUseCase {
  constructor(private service: IAuthService) {}
  async execute(): Promise<boolean> {
    return this.service.reloadUser();
  }
}
