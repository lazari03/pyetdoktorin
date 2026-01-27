import { IAuthLoginService } from '@/application/ports/IAuthLoginService';

export class TestAuthConnectionUseCase {
  constructor(private authLoginService: IAuthLoginService) {}

  async execute(): Promise<void> {
    await this.authLoginService.testConnection();
  }
}
