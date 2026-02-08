import { UserRole } from '../../domain/entities/UserRole';
export type SessionCookiesResult = {
    role: UserRole;
    cookies: string[];
};
export interface IServerSessionService {
    establishSession(idToken: string): Promise<SessionCookiesResult>;
}
//# sourceMappingURL=IServerSessionService.d.ts.map