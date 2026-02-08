"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseServerSessionService = void 0;
const SessionException_1 = require("../application/errors/SessionException");
const UserRole_1 = require("../domain/entities/UserRole");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const THIRTY_MIN = 30 * 60; // seconds
class FirebaseServerSessionService {
    constructor(isProd) {
        this.isProd = isProd;
    }
    buildCookies(role) {
        const secure = this.isProd ? '; Secure' : '';
        const base = `Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}`;
        const now = Date.now();
        return [
            `session=1; ${base}; HttpOnly${secure}`,
            `userRole=${encodeURIComponent(role)}; ${base}${secure}`,
            `lastActivity=${now}; ${base}${secure}`,
            `loggedIn=1; ${base}${secure}`,
        ];
    }
    normalizeRole(raw) {
        const value = typeof raw === 'string' ? raw.toLowerCase() : null;
        if (value && Object.values(UserRole_1.UserRole).includes(value)) {
            return value;
        }
        return UserRole_1.UserRole.Patient;
    }
    async establishSession(idToken) {
        if (!idToken) {
            throw new SessionException_1.SessionException('Missing idToken', 400);
        }
        const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(idToken);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid or expired token';
            throw new SessionException_1.SessionException(`Invalid or expired token: ${message}`, 401);
        }
        const uid = decoded.uid;
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const role = this.normalizeRole(userDoc.data()?.role);
        if (role === UserRole_1.UserRole.null || !Object.values(UserRole_1.UserRole).includes(role)) {
            throw new SessionException_1.SessionException('Role not approved', 403);
        }
        const tokenRole = decoded.role;
        const tokenAdmin = decoded.admin === true;
        const needsClaims = tokenRole !== role || (role === UserRole_1.UserRole.Admin && !tokenAdmin);
        if (needsClaims) {
            await admin.auth().setCustomUserClaims(uid, {
                role,
                admin: role === UserRole_1.UserRole.Admin,
            });
        }
        return {
            role,
            cookies: this.buildCookies(role),
        };
    }
}
exports.FirebaseServerSessionService = FirebaseServerSessionService;
//# sourceMappingURL=serverSessionService.js.map