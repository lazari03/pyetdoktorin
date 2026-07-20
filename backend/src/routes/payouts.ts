import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateBody } from '@/routes/validation';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';

const router = Router();

const DOCTOR_PAYOUTS_COLLECTION = 'doctorPayouts';

type PayoutDoc = {
  appointmentId: string;
  doctorId: string;
  transactionId: string;
  totalAmount: number;
  currency: string;
  payoutAmount: number;
  platformFee: number;
  status: 'pending' | 'paid';
  createdAt: number;
  paidAt?: number;
};

router.get('/summary', requireAuth([UserRole.Admin]), async (_req: AuthenticatedRequest, res) => {
  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const snapshot = await db.collection(DOCTOR_PAYOUTS_COLLECTION).get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PayoutDoc) }));

    const doctorIds = Array.from(new Set(records.map((r) => r.doctorId)));
    const doctorDocs = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const doc = await db.collection('users').doc(doctorId).get();
        return [doctorId, (doc.data() ?? {}) as Record<string, unknown>] as const;
      }),
    );
    const doctorMap = new Map(doctorDocs);

    const byDoctor = new Map<string, {
      doctorId: string;
      doctorName: string;
      currency: string;
      totalAmount: number;
      payoutAmount: number;
      platformFee: number;
      pendingAmount: number;
      pendingCount: number;
      paidAmount: number;
      paidCount: number;
    }>();

    for (const record of records) {
      const data = doctorMap.get(record.doctorId) ?? {};
      const name = [data.name, data.surname].filter(Boolean).join(' ').trim() || (data.email as string) || record.doctorId;
      const entry = byDoctor.get(record.doctorId) ?? {
        doctorId: record.doctorId,
        doctorName: name,
        currency: record.currency ?? env.appointmentPriceCurrency,
        totalAmount: 0,
        payoutAmount: 0,
        platformFee: 0,
        pendingAmount: 0,
        pendingCount: 0,
        paidAmount: 0,
        paidCount: 0,
      };
      entry.totalAmount += record.totalAmount;
      entry.payoutAmount += record.payoutAmount;
      entry.platformFee += record.platformFee;
      if (record.status === 'paid') {
        entry.paidAmount += record.payoutAmount;
        entry.paidCount += 1;
      } else {
        entry.pendingAmount += record.payoutAmount;
        entry.pendingCount += 1;
      }
      byDoctor.set(record.doctorId, entry);
    }

    const doctors = Array.from(byDoctor.values()).sort((a, b) => b.pendingAmount - a.pendingAmount);

    const totals = doctors.reduce(
      (sum, d) => ({
        totalAmount: sum.totalAmount + d.totalAmount,
        payoutAmount: sum.payoutAmount + d.payoutAmount,
        platformFee: sum.platformFee + d.platformFee,
        pendingAmount: sum.pendingAmount + d.pendingAmount,
        paidAmount: sum.paidAmount + d.paidAmount,
      }),
      { totalAmount: 0, payoutAmount: 0, platformFee: 0, pendingAmount: 0, paidAmount: 0 },
    );

    res.json({
      doctorPayoutPercentage: env.doctorPayoutPercentage,
      currency: env.appointmentPriceCurrency,
      totals,
      doctors,
    });
  } catch (error) {
    console.error('Failed to load payout summary', error);
    res.status(500).json({ error: 'Failed to load payout summary' });
  }
});

const markPaidSchema = z.object({ doctorId: z.string().min(1) });

router.post('/mark-paid', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, markPaidSchema, req.body, 'MISSING_DOCTOR_ID');
  if (!payload) return;

  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const snapshot = await db
      .collection(DOCTOR_PAYOUTS_COLLECTION)
      .where('doctorId', '==', payload.doctorId)
      .where('status', '==', 'pending')
      .get();

    if (snapshot.empty) {
      return res.json({ ok: true, updated: 0 });
    }

    const batch = db.batch();
    const paidAt = Date.now();
    snapshot.docs.forEach((doc) => {
      batch.set(doc.ref, { status: 'paid', paidAt }, { merge: true });
    });
    await batch.commit();

    res.json({ ok: true, updated: snapshot.size });
  } catch (error) {
    console.error('Failed to mark payouts as paid', error);
    res.status(500).json({ error: 'Failed to mark payouts as paid' });
  }
});

export default router;
