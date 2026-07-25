import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { env } from '@/config/env';
import { savePushSubscription, removePushSubscription } from '@/services/pushService';

const router = Router();

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().min(1),
    keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().min(1),
});

router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: env.vapidPublicKey });
});

router.post('/subscribe', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid subscription', issues: parsed.error.issues });
  }
  try {
    await savePushSubscription(req.user!.uid, req.user!.role, parsed.data.subscription);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

router.post('/unsubscribe', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = unsubscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues });
  }
  try {
    await removePushSubscription(req.user!.uid, parsed.data.endpoint);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

export default router;
