import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';

const router = Router();

router.get('/role', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({ role: user.role });
});

router.post('/appointment-details', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { ids } = (req.body || {}) as { ids?: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json({ items: [] });
  }
  const admin = getFirebaseAdmin();
  const snapshots = await Promise.all(
    ids.map((id) => admin.firestore().collection('appointments').doc(id).get())
  );
  const items = snapshots
    .filter((doc) => doc.exists)
    .map((doc) => {
      const data = doc.data() ?? {};
      return {
        id: doc.id,
        patientName: (data.patientName as string) ?? null,
        doctorName: (data.doctorName as string) ?? null,
        preferredDate: (data.preferredDate as string) ?? '',
        notes: (data.notes as string) ?? '',
      };
    });
  res.json({ items });
});

router.post('/dismiss/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const dismissingUserId = (req.body as { userId?: string } | undefined)?.userId ?? user.uid;
  const admin = getFirebaseAdmin();
  await admin.firestore().collection('appointments').doc(id).set({
    dismissedBy: { [dismissingUserId]: true },
  }, { merge: true });
  res.json({ ok: true });
});

export default router;
