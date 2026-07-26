import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { createUserNotification } from '@/services/userNotificationsService';

// ponytail: in-memory debounce, not per-error-type — good enough to stop an
// outage from writing hundreds of notification docs; resets on redeploy.
const SYSTEM_FAILURE_DEBOUNCE_MS = 5 * 60 * 1000;
let lastSystemFailureNotifiedAt = 0;

export async function notifyAdmins(
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = getFirebaseAdmin();
    const snap = await admin.firestore().collection('users').where('role', '==', UserRole.Admin).get();
    await Promise.all(
      snap.docs.map((doc) =>
        createUserNotification({
          userId: doc.id,
          type,
          title,
          body,
          ...(metadata ? { metadata } : {}),
        }),
      ),
    );
  } catch (error) {
    console.error(`Failed to notify admins (${type}):`, error);
  }
}

// Debounced separately from notifyAdmins — an unhandled-error storm during an
// outage should alert admins once, not flood them with one notification per
// failed request.
export async function notifyAdminsOfSystemFailure(
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const now = Date.now();
  if (now - lastSystemFailureNotifiedAt < SYSTEM_FAILURE_DEBOUNCE_MS) return;
  lastSystemFailureNotifiedAt = now;
  await notifyAdmins('system_failure', title, body, metadata);
}
