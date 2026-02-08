"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EstablishSessionUseCase_1 = require("../application/auth/EstablishSessionUseCase");
const serverSessionService_1 = require("../services/serverSessionService");
const SessionException_1 = require("../application/errors/SessionException");
const router = (0, express_1.Router)();
router.post('/session', async (req, res) => {
    try {
        const { idToken } = req.body || {};
        const sessionService = new serverSessionService_1.FirebaseServerSessionService(process.env.NODE_ENV === 'production');
        const useCase = new EstablishSessionUseCase_1.EstablishSessionUseCase(sessionService);
        const result = await useCase.execute(idToken);
        res.setHeader('Set-Cookie', result.cookies);
        res.json({ ok: true, role: result.role });
    }
    catch (error) {
        if (error instanceof SessionException_1.SessionException) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Session error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/logout', (_req, res) => {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const expired = 'Path=/; SameSite=Lax; Max-Age=0';
    res.setHeader('Set-Cookie', [
        `session=; ${expired}; HttpOnly${secure}`,
        `userRole=; ${expired}${secure}`,
        `lastActivity=; ${expired}${secure}`,
        `loggedIn=; ${expired}${secure}`,
    ]);
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=auth.js.map