import { IAuthService } from '@/application/ports/IAuthService';

export class ResetUserPasswordUseCase {
  constructor(private authService: IAuthService) {}

  async execute(email: string): Promise<void> {
    await this.authService.resetUserPassword(email);
  }
}
