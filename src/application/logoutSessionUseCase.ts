import { FirebaseSessionRepository } from '../infrastructure/repositories/FirebaseSessionRepository';

export class LogoutSessionUseCase {
  constructor(private sessionRepo: FirebaseSessionRepository) {}

  execute(): void {
    this.sessionRepo.logout();
  }
}
