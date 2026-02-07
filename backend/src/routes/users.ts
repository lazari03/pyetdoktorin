import { Router } from 'express';
import type { auth } from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';

const router = Router();

router.get('/', requireAuth([UserRole.Admin, UserRole.Doctor, UserRole.Pharmacy]), async (req: AuthenticatedRequest, res) => {
  const admin = getFirebaseAdmin();
  const { page: rawPage = '0', pageSize: rawPageSize = '20', search: rawSearch = '', role: rawRole } = req.query as { page?: string; pageSize?: string; search?: string; role?: string };
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
  const snapshot = await admin.firestore().collection('users').get();
  let users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{ id: string } & Record<string, unknown>>;
  if (roleFilter) {
    users = users.filter((user) => String(user.role || '').toLowerCase() === roleFilter);
  }
  if (search) {
    users = users.filter((user) => {
      const haystack = `${(user.name as string | undefined) ?? ''} ${(user.surname as string | undefined) ?? ''} ${(user.email as string | undefined) ?? ''} ${(user.role as string | undefined) ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
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
  const total = users.length;
  const start = page * pageSize;
  const items = users.slice(start, start + pageSize);
  res.json({ items, total, page, pageSize });
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
  const { name, surname, email, password, role = UserRole.Patient, phone } = req.body || {};
  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const normalizedRole = Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : UserRole.Patient;
  const admin = getFirebaseAdmin();
  const displayName = `${name} ${surname}`.trim();
  const phoneNumber = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : undefined;
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
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }, { merge: true });
  res.status(201).json({ id: userRecord.uid, role: normalizedRole });
});

router.patch('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  const updatableFields = ['name', 'surname', 'email', 'role', 'patientNotes', 'allergies', 'chronicConditions', 'phone', 'bio', 'specialization', 'specializations', 'approvalStatus'];
  updatableFields.forEach((field) => {
    const value = body[field];
    if (value !== undefined) {
      updates[field] = value;
    }
  });
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  if (updates.role && !Object.values(UserRole).includes(updates.role as UserRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  await admin.firestore().collection('users').doc(id).set(updates, { merge: true });
  if (updates.role) {
    const updatedRole = updates.role as UserRole;
    await admin.auth().setCustomUserClaims(id, {
      role: updatedRole,
      admin: updatedRole === UserRole.Admin,
    });
  }
  res.json({ ok: true });
});

router.delete('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  await admin.auth().deleteUser(id);
  await admin.firestore().collection('users').doc(id).delete();
  res.json({ ok: true });
});

router.post('/:id/reset-password', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const admin = getFirebaseAdmin();
  const userRecord = await admin.auth().getUser(id);
  if (!userRecord.email) {
    return res.status(400).json({ error: 'User has no email' });
  }
  const link = await admin.auth().generatePasswordResetLink(userRecord.email);
  res.json({ resetLink: link });
});

export default router;
