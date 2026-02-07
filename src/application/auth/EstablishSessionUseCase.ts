import { IServerSessionService, SessionCookiesResult } from '@/application/ports/IServerSessionService';

export class EstablishSessionUseCase {
  constructor(private sessionService: IServerSessionService) {}

  execute(idToken: string): Promise<SessionCookiesResult> {
    return this.sessionService.establishSession(idToken);
  }
}
