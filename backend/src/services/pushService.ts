import crypto from 'crypto';
import webpush from 'web-push';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';

const COLLECTION = 'pushSubscriptions';

let vapidConfigured = false;
function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!env.vapidPublicKey || !env.vapidPrivateKey) return false;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
  vapidConfigured = true;
  return true;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function subscriptionDocId(uid: string, endpoint: string): string {
  const hash = crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 16);
  return `${uid}_${hash}`;
}

export async function savePushSubscription(
  uid: string,
  role: string,
  subscription: PushSubscriptionInput,
): Promise<void> {
  const db = getFirebaseAdmin().firestore();
  await db
    .collection(COLLECTION)
    .doc(subscriptionDocId(uid, subscription.endpoint))
    .set({ uid, role, subscription, createdAt: Date.now() });
}

export async function removePushSubscription(uid: string, endpoint: string): Promise<void> {
  const db = getFirebaseAdmin().firestore();
  await db.collection(COLLECTION).doc(subscriptionDocId(uid, endpoint)).delete();
}

// ponytail: best-effort — a user with multiple devices/tabs can have several
// subscription docs, so failures for one shouldn't block the others.
export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string },
): Promise<void> {
  if (!ensureVapidConfigured() || userIds.length === 0) return;

  const db = getFirebaseAdmin().firestore();
  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const snap = await db.collection(COLLECTION).where('uid', 'in', chunk).get();
    await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data() as { subscription: PushSubscriptionInput };
        try {
          await webpush.sendNotification(data.subscription, JSON.stringify(payload));
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await doc.ref.delete();
          } else {
            console.error('Push send failed:', error);
          }
        }
      }),
    );
  }
}
