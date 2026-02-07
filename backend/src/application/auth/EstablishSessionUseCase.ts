import { IServerSessionService, SessionCookiesResult } from '@/application/ports/IServerSessionService';

export class EstablishSessionUseCase {
  constructor(private readonly sessionService: IServerSessionService) {}

  execute(idToken: string): Promise<SessionCookiesResult> {
    return this.sessionService.establishSession(idToken);
  }
}
