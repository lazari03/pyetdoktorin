import type { Request } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { EstablishSessionUseCase } from '@/application/auth/EstablishSessionUseCase';
import { FirebaseServerSessionService } from '@/services/serverSessionService';
import { SessionException } from '@/application/errors/SessionException';
import { UserRole } from '@/domain/entities/UserRole';
import { validateBody } from '@/routes/validation';
import { AUTH_COOKIE_NAMES, buildExpiredCookie } from '@/config/cookies';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { normalizeUserRole } from '@/domain/rules/userRoleRules';
import {
  resolveSecurityAccountSummaryFromSession,
  writeSecurityAuditLog,
} from '@/services/securityAuditService';

const router = Router();

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

const registrationProfileSchema = z.object({
  name: z.string().min(1).max(120),
  surname: z.string().min(1).max(120),
  phone: z.string().min(1).max(64),
  address: z.string().min(1).max(300),
  country: z.string().min(1).max(120),
  role: z.enum([UserRole.Patient, UserRole.Doctor]),
});

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  return token || null;
}

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

router.post('/register-profile', async (req, res) => {
  const payload = validateBody(res, registrationProfileSchema, req.body, 'INVALID_REGISTRATION_PAYLOAD');
  if (!payload) return;

  const idToken = getBearerToken(req);
  if (!idToken) {
    return res.status(401).json({ error: 'Missing authentication credentials' });
  }

  const admin = getFirebaseAdmin();
  let decoded: Awaited<ReturnType<ReturnType<typeof admin.auth>['verifyIdToken']>>;

  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Registration profile auth error', error);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const role = normalizeUserRole(payload.role);
  if (!role || (role !== UserRole.Patient && role !== UserRole.Doctor)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const email = typeof decoded.email === 'string' && decoded.email.trim()
    ? decoded.email.trim()
    : null;

  if (!email) {
    return res.status(400).json({ error: 'Authenticated account has no email' });
  }

  const createdAt = Date.now();
  const displayName = `${payload.name} ${payload.surname}`.trim();
  const profile = {
    name: payload.name,
    surname: payload.surname,
    phone: payload.phone,
    phoneNumber: payload.phone,
    address: payload.address,
    country: payload.country,
    email,
    role,
    ...(role === UserRole.Doctor ? { approvalStatus: 'pending' as const } : {}),
    createdAt,
    updatedAt: createdAt,
    createdBy: 'self_registration',
  };

  try {
    await admin.firestore().collection('users').doc(decoded.uid).set(profile, { merge: true });

    if (role === UserRole.Doctor) {
      await admin.firestore().collection('notifications').add({
        type: 'doctor_registration',
        userId: decoded.uid,
        name: payload.name,
        surname: payload.surname,
        phoneNumber: payload.phone,
        address: payload.address,
        country: payload.country,
        email,
        createdAt: new Date(),
        status: 'pending',
      });
    }

    await admin.auth().setCustomUserClaims(decoded.uid, {
      role,
      admin: false,
    });

    try {
      await writeSecurityAuditLog({
        type: 'user_registered',
        success: true,
        request: req,
        user: {
          userId: decoded.uid,
          accountName: displayName || email,
          accountEmail: email,
          role,
        },
      });
    } catch (auditError) {
      console.error('Failed to write registration audit log', auditError);
    }

    res.status(201).json({ ok: true, role });
  } catch (error) {
    try {
      await writeSecurityAuditLog({
        type: 'user_registered',
        success: false,
        request: req,
        reason: error instanceof Error ? error.message : 'Failed to persist registration profile',
        user: {
          userId: decoded.uid,
          accountName: displayName || email,
          accountEmail: email,
          role,
        },
      });
    } catch (auditError) {
      console.error('Failed to write registration failure audit log', auditError);
    }
    console.error('Registration profile persistence failed', error);
    res.status(500).json({ error: 'Failed to persist registration profile' });
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
