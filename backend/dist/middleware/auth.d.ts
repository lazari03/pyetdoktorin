import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../domain/entities/UserRole';
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        role: UserRole;
    };
}
export declare function requireAuth(requiredRoles?: UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map