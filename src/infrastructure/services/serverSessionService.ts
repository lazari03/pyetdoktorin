import { IServerSessionService, SessionCookiesResult } from '@/application/ports/IServerSessionService';
import { SessionException } from '@/application/errors/SessionException';
import { UserRole } from '@/domain/entities/UserRole';
import { getAdmin } from '@/app/api/_lib/admin';
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAMES, COOKIE_SAMESITE } from '@/config/cookies';

export class FirebaseServerSessionService implements IServerSessionService {
  constructor(private isProd: boolean) {}

  private buildCookies(role: UserRole): string[] {
    const now = Date.now();
    return [
      `session=1; Path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; HttpOnly${this.isProd ? '; Secure' : ''}`,
      `${AUTH_COOKIE_NAMES.userRole}=${encodeURIComponent(role)}; Path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; HttpOnly${this.isProd ? '; Secure' : ''}`,
      `${AUTH_COOKIE_NAMES.lastActivity}=${now}; Path=/; SameSite=${COOKIE_SAMESITE}; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; HttpOnly${this.isProd ? '; Secure' : ''}`,
    ];
  }

  private normalizeRole(raw: unknown): UserRole {
    const value = typeof raw === 'string' ? raw.toLowerCase() : null;
    if (value && Object.values(UserRole).includes(value as UserRole)) {
      return value as UserRole;
    }
    return UserRole.Patient;
  }

  async establishSession(idToken: string): Promise<SessionCookiesResult> {
    if (!idToken) {
      throw new SessionException('Missing idToken', 400);
    }

    const { auth, db } = getAdmin();

    let decoded: Awaited<ReturnType<typeof auth.verifyIdToken>>;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid or expired token';
      throw new SessionException(`Invalid or expired token: ${message}`, 401);
    }

    const uid = decoded.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const role = this.normalizeRole(userDoc.data()?.role);

    if (role === UserRole.null || !Object.values(UserRole).includes(role)) {
      throw new SessionException('Role not approved', 403);
    }

    const tokenRole = decoded.role as UserRole | undefined;
    const tokenAdmin = decoded.admin === true;
    const needsCustomClaims = tokenRole !== role || (role === UserRole.Admin && !tokenAdmin);

    if (needsCustomClaims) {
      await auth.setCustomUserClaims(uid, {
        role,
        admin: role === UserRole.Admin,
      });
    }

    return {
      role,
      cookies: this.buildCookies(role),
    };
  }
}
