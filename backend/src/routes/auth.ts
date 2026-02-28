import { Router } from 'express';
import { z } from 'zod';
import { EstablishSessionUseCase } from '@/application/auth/EstablishSessionUseCase';
import { FirebaseServerSessionService } from '@/services/serverSessionService';
import { SessionException } from '@/application/errors/SessionException';
import { validateBody } from '@/routes/validation';
import { AUTH_COOKIE_NAMES, buildExpiredCookie } from '@/config/cookies';

const router = Router();

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

router.post('/session', async (req, res) => {
  try {
    const payload = validateBody(res, sessionSchema, req.body, 'INVALID_SESSION_PAYLOAD');
    if (!payload) return;
    const { idToken } = payload;
    const sessionService = new FirebaseServerSessionService(process.env.NODE_ENV === 'production');
    const useCase = new EstablishSessionUseCase(sessionService);
    const result = await useCase.execute(idToken);
    res.setHeader('Set-Cookie', result.cookies);
    res.json({ ok: true, role: result.role });
  } catch (error) {
    if (error instanceof SessionException) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Session error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (_req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
      buildExpiredCookie(AUTH_COOKIE_NAMES.session, isProd),
      buildExpiredCookie(AUTH_COOKIE_NAMES.userRole, isProd),
      buildExpiredCookie(AUTH_COOKIE_NAMES.lastActivity, isProd),
    ]);
    res.json({ ok: true });
});

export default router;
