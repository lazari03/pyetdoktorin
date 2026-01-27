import { ISessionService } from '@/application/ports/ISessionService';

export class LogoutServerUseCase {
  constructor(private sessionService: ISessionService) {}

  async execute(): Promise<void> {
    await this.sessionService.logoutServer();
  }
}
