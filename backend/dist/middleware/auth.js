"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const firebaseAdmin_1 = require("@/config/firebaseAdmin");
const UserRole_1 = require("@/domain/entities/UserRole");
function requireAuth(requiredRoles) {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing Authorization header' });
            }
            const token = authHeader.slice('Bearer '.length);
            const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
            const decoded = await admin.auth().verifyIdToken(token);
            const role = decoded.role ?? UserRole_1.UserRole.Patient;
            req.user = { uid: decoded.uid, role };
            if (requiredRoles && !requiredRoles.includes(role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
        catch (error) {
            console.error('Auth middleware error', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}
//# sourceMappingURL=auth.js.map