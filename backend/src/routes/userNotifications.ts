import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';
import { UserRole } from '@/domain/entities/UserRole';
import {
  archiveAndDeleteExpiredNotifications,
  createUserNotification,
  getArchiveForUser,
  getUnreadCount,
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  RETENTION_MS,
  type UserNotification,
} from '@/services/userNotificationsService';
import { sendPushToUsers } from '@/services/pushService';
import { listReadMarkIds, markRead as markReadMark, markManyRead as markManyReadMarks } from '@/services/readMarksService';
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

const readMarkSchema = z.object({
  id: z.string().min(1),
});

const readMarksBatchSchema = z.object({
  ids: z.array(z.string().min(1)).max(500),
});

const broadcastSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  target: z.enum(['all', 'patient', 'doctor', 'pharmacy']),
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

// Server-persisted read markers for the appointment/prescription notification
// feeds (client-derived lists that aren't their own Firestore collection, so
// "read" state can't live on the item itself the way it does for userNotifications).
// Must not be tracked client-side only (e.g. localStorage) — read state has to
// survive logout/login and follow the account, not the browser.
router.get('/read-marks', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const ids = await listReadMarkIds(req.user!.uid);
    res.json({ ids });
  } catch (error) {
    console.error('Error listing read marks:', error);
    res.status(500).json({ error: 'Failed to fetch read state' });
  }
});

router.post('/read-marks', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = readMarkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues });
  }
  try {
    await markReadMark(req.user!.uid, parsed.data.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error saving read mark:', error);
    res.status(500).json({ error: 'Failed to save read state' });
  }
});

router.post('/read-marks/batch', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = readMarksBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues });
  }
  try {
    await markManyReadMarks(req.user!.uid, parsed.data.ids);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error saving read marks:', error);
    res.status(500).json({ error: 'Failed to save read state' });
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

router.post('/admin/broadcast', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid broadcast', issues: parsed.error.issues });
  }
  const { title, body, target } = parsed.data;

  try {
    const admin = getFirebaseAdmin();
    const usersRef = admin.firestore().collection('users');
    const query = target === 'all' ? usersRef : usersRef.where('role', '==', target);
    const snap = await query.get();
    const userIds = snap.docs.map((doc) => doc.id);

    await Promise.all(
      userIds.map((userId) =>
        createUserNotification({ userId, type: 'platform_announcement', title, body }),
      ),
    );
    void sendPushToUsers(userIds, { title, body });

    res.json({ ok: true, count: userIds.length });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Broadcast failed' });
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
