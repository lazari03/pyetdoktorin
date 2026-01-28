import { IAuthLoginService } from '@/application/ports/IAuthLoginService';

export class LoginUseCase {
  constructor(private authLoginService: IAuthLoginService) {}

  async execute(email: string, password: string): Promise<void> {
    await this.authLoginService.login(email, password);
  }
}
