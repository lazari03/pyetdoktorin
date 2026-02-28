import { IServerSessionService, SessionCookiesResult } from '@/application/ports/IServerSessionService';
import { SessionException } from '@/application/errors/SessionException';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { AUTH_COOKIE_NAMES, AUTH_COOKIE_MAX_AGE_SECONDS, buildAuthCookie } from '@/config/cookies';

export class FirebaseServerSessionService implements IServerSessionService {
  constructor(private readonly isProd: boolean) {}

  private buildCookies(sessionCookie: string, role: UserRole): string[] {
    const now = Date.now();
    return [
      buildAuthCookie({
        name: AUTH_COOKIE_NAMES.session,
        value: sessionCookie,
        isProd: this.isProd,
      }),
      buildAuthCookie({
        name: AUTH_COOKIE_NAMES.userRole,
        value: encodeURIComponent(role),
        isProd: this.isProd,
      }),
      buildAuthCookie({
        name: AUTH_COOKIE_NAMES.lastActivity,
        value: String(now),
        isProd: this.isProd,
      }),
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

    const admin = getFirebaseAdmin();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid or expired token';
      throw new SessionException(`Invalid or expired token: ${message}`, 401);
    }

    const uid = decoded.uid;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const role = this.normalizeRole(userDoc.data()?.role);

    if (role === UserRole.null || !Object.values(UserRole).includes(role)) {
      throw new SessionException('Role not approved', 403);
    }

    const tokenRole = decoded.role as UserRole | undefined;
    const tokenAdmin = decoded.admin === true;
    const needsClaims = tokenRole !== role || (role === UserRole.Admin && !tokenAdmin);
    if (needsClaims) {
      await admin.auth().setCustomUserClaims(uid, {
        role,
        admin: role === UserRole.Admin,
      });
    }
    const expiresIn = AUTH_COOKIE_MAX_AGE_SECONDS * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    return {
      role,
      cookies: this.buildCookies(sessionCookie, role),
    };
  }
}
