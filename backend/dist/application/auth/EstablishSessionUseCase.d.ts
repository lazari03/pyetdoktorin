import { IServerSessionService, SessionCookiesResult } from '../../application/ports/IServerSessionService';
export declare class EstablishSessionUseCase {
    private readonly sessionService;
    constructor(sessionService: IServerSessionService);
    execute(idToken: string): Promise<SessionCookiesResult>;
}
//# sourceMappingURL=EstablishSessionUseCase.d.ts.map