import type { IAuthService } from './ports/IAuthService';

export class ApplyVerificationCodeUseCase {
  constructor(private service: IAuthService) {}
  async execute(oobCode: string): Promise<void> {
    return this.service.applyVerificationCode(oobCode);
  }
}
