import { Router } from 'express';
import { EstablishSessionUseCase } from '@/application/auth/EstablishSessionUseCase';
import { FirebaseServerSessionService } from '@/services/serverSessionService';
import { SessionException } from '@/application/errors/SessionException';

const router = Router();

router.post('/session', async (req, res) => {
  try {
    const { idToken } = req.body || {};
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

export default router;
