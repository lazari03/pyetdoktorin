import { Router } from 'express';
import { z } from 'zod';
import type { auth } from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { validateBody, validateQuery } from '@/routes/validation';
import {
  resolveSecurityAccountSummary,
  type SecurityAccountSummary,
  writeSecurityAuditLog,
} from '@/services/securityAuditService';

const router = Router();

type FirestoreUser = { id: string } & Record<string, unknown>;
const allUserRoles = Object.values(UserRole) as UserRole[];

const usersQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  role: z.string().optional(),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  surname: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  patientNotes: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  approvalStatus: z.string().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'No fields to update',
});

const selfProfileSchema = z.object({
  name: z.string().max(120).optional(),
  surname: z.string().max(120).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().max(64).optional(),
  about: z.string().max(4000).optional(),
  specializations: z.array(z.string().max(160)).max(50).optional(),
  education: z.array(z.string().max(200)).max(50).optional(),
  profilePicture: z.string().max(2000).optional(),
  lastCheckupDate: z.string().max(40).optional(),
  nextCheckupDueDate: z.string().max(40).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: z.string().max(64).optional(),
  preferredLanguage: z.string().max(40).optional(),
  timeZone: z.string().max(100).optional(),
  communicationPreference: z.enum(['video', 'voice', 'chat']).optional(),
  shareSummaryConsent: z.boolean().optional(),
  signatureDataUrl: z.string().max(200000).optional(),
  dashboardTutorialSeen: z.boolean().optional(),
  dashboardTutorialVersion: z.number().int().min(0).max(100).optional(),
  dashboardTutorialSeenAt: z.string().max(80).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'No fields to update',
});

type SelfProfileUpdate = z.infer<typeof selfProfileSchema>;

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function buildName(name?: string, surname?: string, fallback?: string): string | undefined {
  const combined = [name, surname].filter((value) => Boolean(value)).join(' ').trim();
  return combined || fallback;
}

async function safeWriteAuditLog(
  params: Parameters<typeof writeSecurityAuditLog>[0],
  errorLabel: string,
): Promise<void> {
  try {
    await writeSecurityAuditLog(params);
  } catch (error) {
    console.error(errorLabel, error);
  }
}

function mapCurrentUserResponse(
  uid: string,
  role: UserRole,
  userData: Record<string, unknown>,
  authUser: auth.UserRecord | null,
) {
  const phoneNumber =
    stringOrUndefined(userData.phoneNumber) ??
    stringOrUndefined(userData.phone) ??
    authUser?.phoneNumber ??
    undefined;

  return {
    ...userData,
    id: uid,
    uid,
    role,
    email:
      stringOrUndefined(userData.email) ??
      authUser?.email ??
      undefined,
    emailVerified: authUser?.emailVerified ?? false,
    name:
      stringOrUndefined(userData.name) ??
      authUser?.displayName ??
      undefined,
    surname: stringOrUndefined(userData.surname) ?? undefined,
    phoneNumber,
  };
}

function normalizeSelfProfileUpdate(payload: SelfProfileUpdate): Record<string, unknown> {
  const updates: Record<string, unknown> = {
    ...payload,
    updatedAt: Date.now(),
  };

  if (payload.phoneNumber !== undefined) {
    updates.phoneNumber = payload.phoneNumber;
    updates.phone = payload.phoneNumber;
  }

  return updates;
}

async function resolveActorSummary(req: AuthenticatedRequest): Promise<SecurityAccountSummary | undefined> {
  if (!req.user) return undefined;
  try {
    const summary = await resolveSecurityAccountSummary(req.user.uid);
    return {
      ...summary,
      role: summary.role ?? req.user.role,
    };
  } catch {
    return {
      userId: req.user.uid,
      role: req.user.role,
    };
  }
}

function mapUsers(snapshot: FirebaseFirestore.QuerySnapshot): FirestoreUser[] {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreUser[];
}

async function getQueryCount(query: FirebaseFirestore.Query): Promise<number> {
  const countFn = (query as FirebaseFirestore.Query & {
    count?: () => {
      get: () => Promise<{ data: () => { count: number } }>;
    };
  }).count;

  if (typeof countFn === 'function') {
    const snapshot = await countFn.call(query).get();
    return snapshot.data().count;
  }

  const snapshot = await query.get();
  return snapshot.size;
}

router.get('/', requireAuth([UserRole.Admin, UserRole.Doctor, UserRole.Pharmacy]), async (req: AuthenticatedRequest, res) => {
  const admin = getFirebaseAdmin();
  const query = validateQuery(res, usersQuerySchema, req.query, 'INVALID_QUERY');
  if (!query) return;
  const { page: rawPage = '0', pageSize: rawPageSize = '20', search: rawSearch = '', role: rawRole } = query;
  const page = Math.max(0, parseInt(rawPage, 10) || 0);
  const pageSize = Math.min(100, Math.max(1, parseInt(rawPageSize, 10) || 20));
  const search = (rawSearch || '').trim().toLowerCase();
  const roleFilter = typeof rawRole === 'string' && rawRole.trim().length > 0 ? rawRole.toLowerCase() : undefined;
  const actorRole = req.user?.role;
  if (!actorRole) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (actorRole !== UserRole.Admin) {
    if (!roleFilter) {
      return res.status(403).json({ error: 'Role filter required' });
    }
    const allowedRoles = actorRole === UserRole.Doctor ? [UserRole.Patient, UserRole.Pharmacy] : [UserRole.Patient];
    if (!allowedRoles.includes(roleFilter as UserRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  const collectionRef = admin.firestore().collection('users');
  const baseQuery = roleFilter
    ? collectionRef.where('role', '==', roleFilter)
    : collectionRef;
  let users: FirestoreUser[] = [];
  let total = 0;
  if (!search) {
    total = await getQueryCount(baseQuery);
    const snapshot = await baseQuery
      .offset(page * pageSize)
      .limit(pageSize)
      .get();
    users = mapUsers(snapshot);
  } else {
    const snapshot = await baseQuery.get();
    users = mapUsers(snapshot);
    total = users.length;
  }
  if (search) {
    users = users.filter((user) => {
      const haystack = `${(user.name as string | undefined) ?? ''} ${(user.surname as string | undefined) ?? ''} ${(user.email as string | undefined) ?? ''} ${(user.role as string | undefined) ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
    total = users.length;
  }
  if (actorRole !== UserRole.Admin) {
    users = users.map((user) => ({
      id: user.id,
      role: user.role,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      pharmacyName: user.pharmacyName,
    }));
  }
  const start = page * pageSize;
  const items = search ? users.slice(start, start + pageSize) : users;
  res.json({ items, total, page, pageSize });
});

router.get('/me', requireAuth(undefined, { allowUnverified: true }), async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const role = req.user!.role;
  const admin = getFirebaseAdmin();
  const [doc, authUser] = await Promise.all([
    admin.firestore().collection('users').doc(uid).get(),
    admin.auth().getUser(uid).catch(() => null),
  ]);
  const data = (doc.data() ?? {}) as Record<string, unknown>;
  res.json(mapCurrentUserResponse(uid, role, data, authUser));
});

router.patch('/me', requireAuth(allUserRoles, { allowUnverified: true }), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, selfProfileSchema, req.body, 'NO_FIELDS_TO_UPDATE');
  if (!payload) return;
  const uid = req.user!.uid;
  const role = req.user!.role;
  const admin = getFirebaseAdmin();
  const updates = normalizeSelfProfileUpdate(payload);

  await admin.firestore().collection('users').doc(uid).set(updates, { merge: true });

  const [doc, authUser] = await Promise.all([
    admin.firestore().collection('users').doc(uid).get(),
    admin.auth().getUser(uid).catch(() => null),
  ]);
  const data = (doc.data() ?? {}) as Record<string, unknown>;
  res.json({ ok: true, profile: mapCurrentUserResponse(uid, role, data, authUser) });
});

router.get('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection('users').doc(id).get();
  if (!doc.exists) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: doc.id, ...doc.data() });
});

router.post('/', requireAuth([UserRole.Admin]), async (req, res) => {
  const payload = validateBody(res, createUserSchema, req.body, 'MISSING_REQUIRED_FIELDS');
  if (!payload) return;
  const { name, surname, email, password, role = UserRole.Patient, phone } = payload;
  const normalizedRole = Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : UserRole.Patient;
  const admin = getFirebaseAdmin();
  const actor = await resolveActorSummary(req as AuthenticatedRequest);
  const displayName = `${name} ${surname}`.trim();
  const phoneNumber = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : undefined;
  try {
    const createRequest: auth.CreateRequest = {
      email,
      password,
      displayName,
    };
    if (phoneNumber) {
      createRequest.phoneNumber = phoneNumber;
    }
    const userRecord = await admin.auth().createUser(createRequest);
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: normalizedRole,
      admin: normalizedRole === UserRole.Admin,
    });
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      surname,
      role: normalizedRole,
      email,
      phone: phoneNumber ?? null,
      phoneNumber: phoneNumber ?? null,
      createdBy: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });
    await safeWriteAuditLog({
      type: 'user_created',
      success: true,
      request: req,
      user: actor,
      targetUser: {
        userId: userRecord.uid,
        accountName: displayName || email,
        accountEmail: email,
        role: normalizedRole,
      },
    }, 'Failed to write user creation audit log');
    res.status(201).json({ id: userRecord.uid, role: normalizedRole });
  } catch (error) {
    await safeWriteAuditLog({
      type: 'user_created',
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to create user',
      request: req,
      user: actor,
      targetUser: {
        accountName: displayName || email,
        accountEmail: email,
        role: normalizedRole,
      },
    }, 'Failed to write user creation audit failure log');
    console.error('User creation failed', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const actor = await resolveActorSummary(req as AuthenticatedRequest);
  const updates = validateBody(res, updateUserSchema, req.body, 'NO_FIELDS_TO_UPDATE');
  if (!updates) return;
  if (updates.role && !Object.values(UserRole).includes(updates.role as UserRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const existingDoc = await admin.firestore().collection('users').doc(id).get();
  if (!existingDoc.exists) {
    return res.status(404).json({ error: 'User not found' });
  }
  const existingData = existingDoc.data() as Record<string, unknown>;
  const beforeTarget: SecurityAccountSummary = {
    userId: id,
    accountName: buildName(
      stringOrUndefined(existingData.name),
      stringOrUndefined(existingData.surname),
      stringOrUndefined(existingData.email),
    ),
    accountEmail: stringOrUndefined(existingData.email),
    role: stringOrUndefined(existingData.role),
  };
  try {
    const authUpdates: auth.UpdateRequest = {};
    if (updates.email !== undefined) {
      authUpdates.email = updates.email;
    }
    if (updates.phone !== undefined) {
      authUpdates.phoneNumber = updates.phone.trim() ? updates.phone : null;
    }
    if (updates.name !== undefined || updates.surname !== undefined) {
      const nextName = updates.name ?? stringOrUndefined(existingData.name);
      const nextSurname = updates.surname ?? stringOrUndefined(existingData.surname);
      authUpdates.displayName = buildName(nextName, nextSurname) ?? null;
    }
    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(id, authUpdates);
    }

    const firestoreUpdates: Record<string, unknown> = {
      ...updates,
      updatedAt: Date.now(),
    };
    if (updates.phone !== undefined) {
      firestoreUpdates.phone = updates.phone;
      firestoreUpdates.phoneNumber = updates.phone;
    }
    await admin.firestore().collection('users').doc(id).set(firestoreUpdates, { merge: true });
    if (updates.role) {
      const updatedRole = updates.role as UserRole;
      await admin.auth().setCustomUserClaims(id, {
        role: updatedRole,
        admin: updatedRole === UserRole.Admin,
      });
    }
    await safeWriteAuditLog({
      type: 'user_updated',
      success: true,
      request: req,
      user: actor,
      targetUser: {
        userId: id,
        accountName: buildName(
          updates.name ?? stringOrUndefined(existingData.name),
          updates.surname ?? stringOrUndefined(existingData.surname),
          updates.email ?? stringOrUndefined(existingData.email),
        ),
        accountEmail: updates.email ?? stringOrUndefined(existingData.email),
        role: updates.role ?? stringOrUndefined(existingData.role),
      },
      metadata: {
        fields: Object.keys(updates),
      },
    }, 'Failed to write user update audit log');
    res.json({ ok: true });
  } catch (error) {
    await safeWriteAuditLog({
      type: 'user_updated',
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to update user',
      request: req,
      user: actor,
      targetUser: beforeTarget,
      metadata: {
        fields: Object.keys(updates),
      },
    }, 'Failed to write user update audit failure log');
    console.error('User update failed', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const actor = await resolveActorSummary(req as AuthenticatedRequest);
  const existingDoc = await admin.firestore().collection('users').doc(id).get();
  const existingData = (existingDoc.data() ?? {}) as Record<string, unknown>;
  const targetUser: SecurityAccountSummary = {
    userId: id,
    accountName: buildName(
      stringOrUndefined(existingData.name),
      stringOrUndefined(existingData.surname),
      stringOrUndefined(existingData.email),
    ),
    accountEmail: stringOrUndefined(existingData.email),
    role: stringOrUndefined(existingData.role),
  };
  try {
    await admin.auth().deleteUser(id);
    await admin.firestore().collection('users').doc(id).delete();
    await safeWriteAuditLog({
      type: 'user_deleted',
      success: true,
      request: req,
      user: actor,
      targetUser,
    }, 'Failed to write user deletion audit log');
    res.json({ ok: true });
  } catch (error) {
    await safeWriteAuditLog({
      type: 'user_deleted',
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to delete user',
      request: req,
      user: actor,
      targetUser,
    }, 'Failed to write user deletion audit failure log');
    console.error('User deletion failed', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.post('/:id/reset-password', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const actor = await resolveActorSummary(req as AuthenticatedRequest);
  try {
    const userRecord = await admin.auth().getUser(id);
    if (!userRecord.email) {
      return res.status(400).json({ error: 'User has no email' });
    }
    const link = await admin.auth().generatePasswordResetLink(userRecord.email);
    await safeWriteAuditLog({
      type: 'user_reset_password',
      success: true,
      request: req,
      user: actor,
      targetUser: {
        userId: userRecord.uid,
        accountName: userRecord.displayName ?? userRecord.email ?? userRecord.uid,
        accountEmail: userRecord.email ?? undefined,
      },
    }, 'Failed to write user reset-password audit log');
    res.json({ resetLink: link });
  } catch (error) {
    await safeWriteAuditLog({
      type: 'user_reset_password',
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to generate reset link',
      request: req,
      user: actor,
      targetUser: { userId: id },
    }, 'Failed to write user reset-password audit failure log');
    console.error('Password reset link generation failed', error);
    res.status(500).json({ error: 'Failed to generate reset link' });
  }
});

export default router;
