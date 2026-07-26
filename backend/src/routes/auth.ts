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
import { PLATFORM_TERMS_VERSION } from '@/content/platformTermsContent';
import { validateRegistrationEmail } from '@/services/emailValidationService';

const router = Router();

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

const validateEmailSchema = z.object({
  email: z.string().email(),
});

const registrationProfileSchema = z.object({
  name: z.string().min(1).max(120),
  surname: z.string().min(1).max(120),
  phone: z.string().min(1).max(64),
  address: z.string().min(1).max(300),
  country: z.string().min(1).max(120),
  role: z.enum([UserRole.Patient, UserRole.Doctor]),
  acceptedTermsVersion: z.string().min(1),
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

// Public — called before the Firebase Auth account even exists, so the
// frontend can reject a disposable/unreachable email before creating one.
router.post('/validate-email', async (req, res) => {
  const parsed = validateEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.json({ valid: false, reason: 'invalid_format' });
  }
  try {
    const result = await validateRegistrationEmail(parsed.data.email);
    res.json(result);
  } catch (error) {
    console.error('Error validating registration email:', error);
    // Fail open on unexpected errors (e.g. a DNS resolver hiccup) — this is a
    // fraud-reduction check, not the sole gate, and register-profile below
    // re-validates before a profile is actually created.
    res.json({ valid: true });
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

  if (payload.acceptedTermsVersion !== PLATFORM_TERMS_VERSION) {
    return res.status(409).json({ error: 'TERMS_OUT_OF_DATE' });
  }

  const email = typeof decoded.email === 'string' && decoded.email.trim()
    ? decoded.email.trim()
    : null;

  if (!email) {
    return res.status(400).json({ error: 'Authenticated account has no email' });
  }

  // Defense in depth — the frontend already calls /validate-email before
  // creating the Firebase Auth account, but this is the actual gate that
  // decides whether a usable profile (and therefore role/access) gets
  // created at all.
  const emailCheck = await validateRegistrationEmail(email);
  if (!emailCheck.valid) {
    return res.status(422).json({ error: 'EMAIL_NOT_ALLOWED', reason: emailCheck.reason });
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
    acceptedPlatformTermsVersion: payload.acceptedTermsVersion,
    acceptedPlatformTermsAt: createdAt,
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

const oauthProfileSchema = z.object({
  acceptedTermsVersion: z.string().min(1).optional(),
});

// Called right after a Google (or other OAuth provider) sign-in. Idempotent:
// if a Firestore profile already exists for this uid (returning user), it's a
// no-op. For a genuinely new sign-in, a profile is created — defaulting to
// Patient, since there's no role picker in the OAuth flow — but only once the
// caller has actually accepted the current platform terms; the backend is the
// authority on this (not a client-side "isNewUser" flag) so a user who
// abandons the terms modal mid-flow can safely retry later rather than being
// permanently stuck with an auth account but no profile.
router.post('/oauth-profile', async (req, res) => {
  const payload = validateBody(res, oauthProfileSchema, req.body, 'INVALID_PAYLOAD');
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
    console.error('OAuth profile auth error', error);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const uid = decoded.uid;

  try {
    const existing = await admin.firestore().collection('users').doc(uid).get();
    if (existing.exists) {
      return res.json({ ok: true, created: false });
    }

    if (!payload.acceptedTermsVersion || payload.acceptedTermsVersion !== PLATFORM_TERMS_VERSION) {
      return res.status(428).json({ error: 'TERMS_REQUIRED' });
    }

    const email = typeof decoded.email === 'string' && decoded.email.trim()
      ? decoded.email.trim()
      : null;
    if (!email) {
      return res.status(400).json({ error: 'Authenticated account has no email' });
    }

    const emailCheck = await validateRegistrationEmail(email);
    if (!emailCheck.valid) {
      return res.status(422).json({ error: 'EMAIL_NOT_ALLOWED', reason: emailCheck.reason });
    }

    const displayName = typeof decoded.name === 'string' ? decoded.name.trim() : '';
    const [firstName, ...rest] = displayName.split(/\s+/).filter(Boolean);
    const surname = rest.join(' ');

    const createdAt = Date.now();
    const profile = {
      name: firstName || email.split('@')[0],
      surname,
      phone: '',
      phoneNumber: '',
      address: '',
      country: '',
      email,
      role: UserRole.Patient,
      createdAt,
      updatedAt: createdAt,
      createdBy: 'google_oauth',
      acceptedPlatformTermsVersion: payload.acceptedTermsVersion,
      acceptedPlatformTermsAt: createdAt,
    };

    await admin.firestore().collection('users').doc(uid).set(profile, { merge: true });
    await admin.auth().setCustomUserClaims(uid, { role: UserRole.Patient, admin: false });

    try {
      await writeSecurityAuditLog({
        type: 'user_registered',
        success: true,
        request: req,
        user: {
          userId: uid,
          accountName: displayName || email,
          accountEmail: email,
          role: UserRole.Patient,
        },
      });
    } catch (auditError) {
      console.error('Failed to write OAuth registration audit log', auditError);
    }

    res.status(201).json({ ok: true, created: true, role: UserRole.Patient });
  } catch (error) {
    console.error('OAuth profile persistence failed', error);
    res.status(500).json({ error: 'Failed to persist profile' });
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
