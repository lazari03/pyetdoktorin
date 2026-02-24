import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { validateBody } from '@/routes/validation';

const router = Router();

const appointmentDetailsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
});

router.get('/role', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({ role: user.role });
});

router.post('/appointment-details', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, appointmentDetailsSchema, req.body, 'INVALID_PAYLOAD');
  if (!payload) return;
  const { ids } = payload;
  const admin = getFirebaseAdmin();
  const snapshots = await Promise.all(
    ids.map((id) => admin.firestore().collection('appointments').doc(id).get())
  );
  const user = req.user!;
  const items = snapshots
    .filter((doc) => doc.exists)
    .map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        patientName: (data.patientName as string) ?? null,
        doctorName: (data.doctorName as string) ?? null,
        preferredDate: (data.preferredDate as string) ?? '',
        notes: (data.notes as string) ?? (data.note as string) ?? '',
        patientId: (data.patientId as string) ?? '',
        doctorId: (data.doctorId as string) ?? '',
      };
    })
    .filter((item) => {
      if (user.role === UserRole.Admin) return true;
      return item.patientId === user.uid || item.doctorId === user.uid;
    })
    .map(({ patientId, doctorId, ...rest }) => rest);
  res.json({ items });
});

router.post('/dismiss/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const admin = getFirebaseAdmin();
  await admin.firestore().collection('appointments').doc(id).set({
    dismissedBy: { [user.uid]: true },
  }, { merge: true });
  res.json({ ok: true });
});

export default router;
