import type { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: UserRole;
    authTime?: number;
  };
}

export function requireAuth(requiredRoles?: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Authorization header' });
      }
      const token = authHeader.slice('Bearer '.length);
      const admin = getFirebaseAdmin();
      const decoded = await admin.auth().verifyIdToken(token);
      const normalizeRole = (raw: unknown): UserRole | null => {
        if (typeof raw !== 'string') return null;
        const normalized = raw.toLowerCase();
        return Object.values(UserRole).includes(normalized as UserRole) ? (normalized as UserRole) : null;
      };

      let role = normalizeRole(decoded.role);
      if (!role) {
        const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
        const storedRole = normalizeRole(userDoc.data()?.role);
        role = storedRole ?? UserRole.Patient;
        // Backfill custom claims when missing or out of sync
        if (storedRole && storedRole !== normalizeRole(decoded.role)) {
          await admin.auth().setCustomUserClaims(decoded.uid, {
            role: storedRole,
            admin: storedRole === UserRole.Admin,
          });
        }
      }
      const authTime = typeof decoded.auth_time === 'number' ? decoded.auth_time * 1000 : undefined;
      req.user = { uid: decoded.uid, role, authTime };
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
