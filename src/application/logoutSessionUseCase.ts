import { ISessionRepository } from '@/application/ports/ISessionRepository';

export class LogoutSessionUseCase {
  constructor(private sessionRepo: ISessionRepository) {}

  execute(): void {
    this.sessionRepo.logout();
  }
}
