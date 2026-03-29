import type { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeUserRole } from '@/domain/rules/userRoleRules';
import { AUTH_COOKIE_NAMES } from '@/config/cookies';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: UserRole;
    authTime?: number;
  };
}

type RequireAuthOptions = {
  allowUnverified?: boolean;
};

export function requireAuth(requiredRoles?: UserRole[], options?: RequireAuthOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const sessionCookie = req.cookies?.[AUTH_COOKIE_NAMES.session] as string | undefined;
      const admin = getFirebaseAdmin();

      type VerifyIdToken = ReturnType<typeof admin.auth>['verifyIdToken'];
      let decoded: Awaited<ReturnType<VerifyIdToken>>;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length);
        decoded = await admin.auth().verifyIdToken(token);
      } else if (sessionCookie) {
        decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
      } else {
        return res.status(401).json({ error: 'Missing authentication credentials' });
      }

      // Enforce email verification for email-based accounts.
      if (
        options?.allowUnverified !== true &&
        (decoded as { email?: string; email_verified?: boolean }).email &&
        (decoded as { email_verified?: boolean }).email_verified !== true
      ) {
        return res.status(403).json({ error: 'Email not verified' });
      }

      const tokenRole = normalizeUserRole(decoded.role);
      let role = tokenRole;
      if (!role) {
        const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
        const storedRole = normalizeUserRole(userDoc.data()?.role);
        if (!storedRole) {
          return res.status(403).json({ error: 'Role not approved' });
        }
        role = storedRole;
        if (storedRole !== tokenRole) {
          await admin.auth().setCustomUserClaims(decoded.uid, {
            role: storedRole,
            admin: storedRole === UserRole.Admin,
          });
        }
      }
      const authTime = typeof decoded.auth_time === 'number' ? decoded.auth_time * 1000 : undefined;
      const userPayload: { uid: string; role: UserRole; authTime?: number } = { uid: decoded.uid, role };
      if (authTime !== undefined) {
        userPayload.authTime = authTime;
      }
      req.user = userPayload;
      if (requiredRoles && !requiredRoles.includes(role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (error) {
      console.error('Auth middleware error', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
