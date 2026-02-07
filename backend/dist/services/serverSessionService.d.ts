import { IServerSessionService, SessionCookiesResult } from '@/application/ports/IServerSessionService';
export declare class FirebaseServerSessionService implements IServerSessionService {
    private readonly isProd;
    constructor(isProd: boolean);
    private buildCookies;
    private normalizeRole;
    establishSession(idToken: string): Promise<SessionCookiesResult>;
}
//# sourceMappingURL=serverSessionService.d.ts.map