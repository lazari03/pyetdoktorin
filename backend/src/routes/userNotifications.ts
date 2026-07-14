import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';
import {
  archiveAndDeleteExpiredNotifications,
  getArchiveForUser,
  getUnreadCount,
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  RETENTION_MS,
  type UserNotification,
} from '@/services/userNotificationsService';
import { sendPlatformEmail } from '@/services/emailService';
import {
  UserNotificationEmailNotConfiguredError,
  UserNotificationError,
  UserNotificationErrorCode,
} from '@/errors/userNotificationErrors';

const router = Router();

const cleanupSchema = z.object({
  cutoffMs: z.number().optional(),
});

function formatNotificationLine(n: UserNotification): string {
  const date = new Date(n.createdAt).toISOString();
  return `${date} — ${n.title}: ${n.body}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const [items, unreadCount] = await Promise.all([listUserNotifications(uid), getUnreadCount(uid)]);
    res.json({ items, unreadCount });
  } catch (error) {
    console.error('Error listing user notifications:', error);
    res.status(500).json({ error: UserNotificationErrorCode.FetchFailed });
  }
});

router.get('/unread-count', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const unreadCount = await getUnreadCount(req.user!.uid);
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ error: UserNotificationErrorCode.FetchFailed });
  }
});

router.post('/mark-all-read', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const { updated } = await markAllNotificationsRead(req.user!.uid);
    res.json({ ok: true, updated });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: UserNotificationErrorCode.UpdateFailed });
  }
});

router.post('/export', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const admin = getFirebaseAdmin();
    const authUser = await admin.auth().getUser(uid);
    if (!authUser.email) {
      return res.status(400).json({ error: UserNotificationErrorCode.ExportFailed });
    }

    const [live, archived] = await Promise.all([
      listUserNotifications(uid, { limit: 1000 }),
      getArchiveForUser(uid),
    ]);
    const all = [...live, ...archived].sort((a, b) => b.createdAt - a.createdAt);

    const text =
      all.length > 0
        ? all.map(formatNotificationLine).join('\n')
        : 'You have no activity on record yet.';

    await sendPlatformEmail({
      to: authUser.email,
      subject: 'Your Pyet Doktorin activity log',
      text: `Here is your requested activity log:\n\n${text}`,
    });
    res.json({ ok: true });
  } catch (error) {
    if ((error as Error)?.name === 'EmailConfigurationError') {
      const configError = new UserNotificationEmailNotConfiguredError();
      return res.status(configError.status).json({ error: configError.code });
    }
    console.error('Error exporting user notifications:', error);
    res.status(500).json({ error: UserNotificationErrorCode.ExportFailed });
  }
});

// CI/service-to-service only — authenticated via a shared secret header, not a
// Firebase session, since the monthly cleanup is triggered by a GitHub
// Actions cron job with no user to sign in as.
router.post('/admin/cleanup', async (req, res) => {
  const provided = req.headers['x-admin-cleanup-secret'];
  const expected = env.notificationsCleanupSecret;
  if (!expected || typeof provided !== 'string' || !timingSafeEqual(provided, expected)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parsed = cleanupSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: UserNotificationErrorCode.CleanupFailed, issues: parsed.error.issues });
  }

  try {
    const cutoffMs = parsed.data.cutoffMs ?? Date.now() - RETENTION_MS;
    const { archived } = await archiveAndDeleteExpiredNotifications(cutoffMs);
    res.json({ ok: true, archived });
  } catch (error) {
    console.error('Error running notification cleanup:', error);
    res.status(500).json({ error: UserNotificationErrorCode.CleanupFailed });
  }
});

router.post('/:id/read', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  try {
    await markNotificationRead(req.user!.uid, id);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof UserNotificationError) {
      return res.status(error.status).json({ error: error.code });
    }
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: UserNotificationErrorCode.UpdateFailed });
  }
});

export default router;
