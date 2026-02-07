import type { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: UserRole;
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
      const role = (decoded.role as UserRole | undefined) ?? UserRole.Patient;
      req.user = { uid: decoded.uid, role };
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
