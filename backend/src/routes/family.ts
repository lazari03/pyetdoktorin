import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import {
  listMyFamilyMembers,
  listPendingInvites,
  addFamilyMember,
  inviteExistingUser,
  respondToInvite,
  updateFamilyMember,
  removeFamilyMember,
} from '@/services/familyService';
import { FamilyMemberError } from '@/errors/familyErrors';

const router = Router();

const addMemberSchema = z.union([
  z.object({
    email: z.string().email(),
    relationship: z.string().min(1).max(40),
  }),
  z.object({
    name: z.string().min(1).max(120),
    surname: z.string().max(120).optional(),
    relationship: z.string().min(1).max(40),
    dateOfBirth: z.string().max(20).optional(),
    phoneNumber: z.string().max(40).optional(),
  }),
]);

const updateMemberSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  surname: z.string().max(120).optional(),
  relationship: z.string().min(1).max(40).optional(),
  dateOfBirth: z.string().max(20).optional(),
  phoneNumber: z.string().max(40).optional(),
});

const respondSchema = z.object({
  accept: z.boolean(),
});

function handleFamilyError(error: unknown, res: import('express').Response, fallback: string) {
  if (error instanceof FamilyMemberError) {
    return res.status(error.status).json({ error: error.code, message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ error: fallback });
}

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const items = await listMyFamilyMembers(req.user!.uid);
    res.json({ items });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to list family members');
  }
});

router.get('/invites', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const items = await listPendingInvites(req.user!.uid);
    res.json({ items });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to list family invites');
  }
});

router.post('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid family member', issues: parsed.error.issues });
  }
  try {
    const uid = req.user!.uid;
    const member = 'email' in parsed.data
      ? await inviteExistingUser(uid, parsed.data.email, parsed.data.relationship)
      : await addFamilyMember(uid, parsed.data);
    res.status(201).json({ member });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to add family member');
  }
});

router.patch('/:id/respond', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid response', issues: parsed.error.issues });
  }
  try {
    const member = await respondToInvite(id, req.user!.uid, parsed.data.accept);
    res.json({ member });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to respond to family invite');
  }
});

router.patch('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const parsed = updateMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid update', issues: parsed.error.issues });
  }
  try {
    const member = await updateFamilyMember(id, req.user!.uid, parsed.data);
    res.json({ member });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to update family member');
  }
});

router.delete('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  try {
    await removeFamilyMember(id, req.user!.uid);
    res.json({ ok: true });
  } catch (error) {
    handleFamilyError(error, res, 'Failed to remove family member');
  }
});

export default router;
