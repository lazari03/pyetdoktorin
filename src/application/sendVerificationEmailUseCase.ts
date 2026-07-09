import type { IAuthService } from './ports/IAuthService';

export class SendVerificationEmailUseCase {
  constructor(private service: IAuthService) {}
  async execute(continueUrl?: string): Promise<void> {
    return this.service.sendVerificationEmail(continueUrl);
  }
}
