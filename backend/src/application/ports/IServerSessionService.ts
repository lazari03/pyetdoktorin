import { UserRole } from '@/domain/entities/UserRole';

export type SessionCookiesResult = {
  role: UserRole;
  cookies: string[];
  userId: string;
  accountName?: string | undefined;
  accountEmail?: string | undefined;
};

export interface IServerSessionService {
  establishSession(idToken: string): Promise<SessionCookiesResult>;
}
