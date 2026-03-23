import { Router } from 'express';
import { z } from 'zod';
import { EstablishSessionUseCase } from '@/application/auth/EstablishSessionUseCase';
import { FirebaseServerSessionService } from '@/services/serverSessionService';
import { SessionException } from '@/application/errors/SessionException';
import { validateBody } from '@/routes/validation';
import { AUTH_COOKIE_NAMES, buildExpiredCookie } from '@/config/cookies';
import {
  resolveSecurityAccountSummaryFromSession,
  writeSecurityAuditLog,
} from '@/services/securityAuditService';

const router = Router();

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

router.post('/session', async (req, res) => {
  const payload = validateBody(res, sessionSchema, req.body, 'INVALID_SESSION_PAYLOAD');
  if (!payload) return;

  try {
    const { idToken } = payload;
    const sessionService = new FirebaseServerSessionService(process.env.NODE_ENV === 'production');
    const useCase = new EstablishSessionUseCase(sessionService);
    const result = await useCase.execute(idToken);
    try {
      await writeSecurityAuditLog({
        type: 'session_established',
        success: true,
        request: req,
        user: {
          userId: result.userId,
          accountName: result.accountName,
          accountEmail: result.accountEmail,
          role: result.role,
        },
      });
    } catch (auditError) {
      console.error('Failed to write session success audit log', auditError);
    }
    res.setHeader('Set-Cookie', result.cookies);
    res.json({ ok: true, role: result.role });
  } catch (error) {
    try {
      await writeSecurityAuditLog({
        type: 'session_establishment_failed',
        success: false,
        request: req,
        reason: error instanceof Error ? error.message : 'Unknown session error',
      });
    } catch (auditError) {
      console.error('Failed to write session audit log', auditError);
    }
    if (error instanceof SessionException) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Session error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    try {
      const user = await resolveSecurityAccountSummaryFromSession(req);
      await writeSecurityAuditLog({
        type: 'logout',
        success: true,
        request: req,
        user,
      });
    } catch (error) {
      console.error('Failed to write logout audit log', error);
    }
    res.setHeader('Set-Cookie', [
      buildExpiredCookie(AUTH_COOKIE_NAMES.session, isProd),
      buildExpiredCookie(AUTH_COOKIE_NAMES.userRole, isProd),
      buildExpiredCookie(AUTH_COOKIE_NAMES.lastActivity, isProd),
    ]);
    res.json({ ok: true });
});

export default router;
