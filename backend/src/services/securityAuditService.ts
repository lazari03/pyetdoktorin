import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '@/config/cookies';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';

export type SecurityAuditType =
  | 'session_established'
  | 'session_establishment_failed'
  | 'logout'
  | 'video_access_attempt'
  | 'user_registered'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_reset_password'
  | 'clinic_booking_status_updated'
  | 'blog_post_created'
  | 'blog_post_updated'
  | 'blog_post_deleted';

export type SecurityAccountSummary = {
  userId?: string | undefined;
  accountName?: string | undefined;
  accountEmail?: string | undefined;
  role?: string | undefined;
};

export type SecurityAuditEntry = SecurityAccountSummary & {
  id: string;
  type: string;
  success: boolean;
  reason?: string | undefined;
  appointmentId?: string | undefined;
  targetUserId?: string | undefined;
  targetAccountName?: string | undefined;
  targetAccountEmail?: string | undefined;
  targetRole?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  forwardedFor?: string | undefined;
  userAgent?: string | undefined;
  country?: string | undefined;
  region?: string | undefined;
  city?: string | undefined;
  location?: string | undefined;
  requestPath?: string | undefined;
  requestMethod?: string | undefined;
  createdAt?: string | undefined;
};

function normalizeString(value: unknown, maxLength = 300): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function omitUndefined<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}

function getHeaderValue(req: Request, names: string[]): string | undefined {
  for (const name of names) {
    const raw = req.headers[name.toLowerCase()];
    if (Array.isArray(raw)) {
      const joined = raw.join(', ');
      const normalized = normalizeString(joined, 500);
      if (normalized) return normalized;
      continue;
    }
    const normalized = normalizeString(raw, 500);
    if (normalized) return normalized;
  }
  return undefined;
}

function buildAccountName(data: Record<string, unknown>, emailFallback?: string, uidFallback?: string): string | undefined {
  const fullName = [normalizeString(data.name, 120), normalizeString(data.surname, 120)]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) return fullName;

  const displayName = normalizeString(data.displayName, 200);
  if (displayName) return displayName;

  const email = normalizeString(data.email, 200) ?? emailFallback;
  if (email) return email;

  return uidFallback;
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  if (typeof value === 'object' && value && 'toDate' in value && typeof value.toDate === 'function') {
    try {
      const date = value.toDate() as Date;
      return date.toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function extractSecurityClientContext(req: Request) {
  const forwardedFor = getHeaderValue(req, ['x-forwarded-for']);
  const firstForwardedIp = forwardedFor
    ?.split(',')
    .map((segment) => segment.trim())
    .find(Boolean);
  const ipAddress = normalizeString(
    getHeaderValue(req, ['cf-connecting-ip', 'x-real-ip', 'x-client-ip']) ||
      firstForwardedIp ||
      req.socket.remoteAddress ||
      undefined,
    120,
  );
  const country = normalizeString(
    getHeaderValue(req, ['x-vercel-ip-country', 'cf-ipcountry', 'x-appengine-country', 'cloudfront-viewer-country']),
    64,
  );
  const region = normalizeString(
    getHeaderValue(req, [
      'x-vercel-ip-country-region',
      'x-appengine-region',
      'cloudfront-viewer-country-region',
    ]),
    64,
  );
  const city = normalizeString(getHeaderValue(req, ['x-vercel-ip-city', 'x-appengine-city']), 120);
  const location = [city, region, country].filter(Boolean).join(', ') || undefined;
  const userAgent = normalizeString(req.get('user-agent'), 500);

  return {
    ipAddress,
    forwardedFor,
    userAgent,
    country,
    region,
    city,
    location,
    requestPath: normalizeString(req.originalUrl || req.path, 200),
    requestMethod: normalizeString(req.method, 16),
  };
}

export async function resolveSecurityAccountSummary(userId: string): Promise<SecurityAccountSummary> {
  const admin = getFirebaseAdmin();
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const data = (userDoc.data() ?? {}) as Record<string, unknown>;

  const fallbackEmail = normalizeString(data.email, 200);
  let fallbackName = buildAccountName(data, fallbackEmail, userId);

  if (!fallbackEmail || !fallbackName) {
    try {
      const authUser = await admin.auth().getUser(userId);
      const authEmail = normalizeString(authUser.email, 200);
      const authDisplayName = normalizeString(authUser.displayName, 200);
      fallbackName = fallbackName || authDisplayName || authEmail || userId;
      return {
        userId,
        accountName: fallbackName,
        accountEmail: fallbackEmail || authEmail,
        role: normalizeString(data.role, 64),
      };
    } catch {
      // Fall back to Firestore-only data.
    }
  }

  return {
    userId,
    accountName: fallbackName,
    accountEmail: fallbackEmail,
    role: normalizeString(data.role, 64),
  };
}

export async function resolveSecurityAccountSummaryFromSession(
  req: Request,
): Promise<SecurityAccountSummary | undefined> {
  const sessionCookie = normalizeString(req.cookies?.[AUTH_COOKIE_NAMES.session], 4000);
  if (!sessionCookie) return undefined;

  const admin = getFirebaseAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, false);
    const summary = await resolveSecurityAccountSummary(decoded.uid);
    return {
      ...summary,
      role: summary.role || normalizeString(decoded.role, 64),
    };
  } catch {
    return undefined;
  }
}

export async function writeSecurityAuditLog(params: {
  type: SecurityAuditType;
  success: boolean;
  reason?: string | undefined;
  request: Request;
  user?: SecurityAccountSummary | undefined;
  targetUser?: SecurityAccountSummary | undefined;
  metadata?: Record<string, unknown> | undefined;
  appointmentId?: string | undefined;
}): Promise<void> {
  const admin = getFirebaseAdmin();
  const client = extractSecurityClientContext(params.request);
  const user = params.user ?? {};
  const targetUser = params.targetUser ?? {};

  await admin.firestore().collection('securityAuditLogs').add(omitUndefined({
    type: params.type,
    success: params.success,
    reason: normalizeString(params.reason, 500),
    appointmentId: normalizeString(params.appointmentId, 120),
    userId: normalizeString(user.userId, 160),
    accountName: normalizeString(user.accountName, 200),
    accountEmail: normalizeString(user.accountEmail, 200),
    role: normalizeString(user.role, 64),
    targetUserId: normalizeString(targetUser.userId, 160),
    targetAccountName: normalizeString(targetUser.accountName, 200),
    targetAccountEmail: normalizeString(targetUser.accountEmail, 200),
    targetRole: normalizeString(targetUser.role, 64),
    metadata: params.metadata ? omitUndefined(params.metadata) : undefined,
    ...client,
    createdAt: new Date(),
  }));
}

export async function listSecurityAuditLogs(limit: number): Promise<SecurityAuditEntry[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin
    .firestore()
    .collection('securityAuditLogs')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const accountCache = new Map<string, Promise<SecurityAccountSummary>>();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as Record<string, unknown>;
      const userId = normalizeString(data.userId, 160);

      let accountName = normalizeString(data.accountName, 200);
      let accountEmail = normalizeString(data.accountEmail, 200);
      let role = normalizeString(data.role, 64);

      if (userId && (!accountName || !accountEmail || !role)) {
        let summaryPromise = accountCache.get(userId);
        if (!summaryPromise) {
          summaryPromise = resolveSecurityAccountSummary(userId);
          accountCache.set(userId, summaryPromise);
        }
        const summary = await summaryPromise;
        accountName = accountName || summary.accountName;
        accountEmail = accountEmail || summary.accountEmail;
        role = role || summary.role;
      }

      const country = normalizeString(data.country, 64);
      const region = normalizeString(data.region, 64);
      const city = normalizeString(data.city, 120);
      const location =
        normalizeString(data.location, 200) ||
        [city, region, country].filter(Boolean).join(', ') ||
        undefined;

      return {
        id: doc.id,
        type: normalizeString(data.type, 120) || 'unknown',
        success: data.success !== false,
        reason: normalizeString(data.reason, 500),
        appointmentId: normalizeString(data.appointmentId, 120),
        userId,
        accountName,
        accountEmail,
        role,
        targetUserId: normalizeString(data.targetUserId, 160),
        targetAccountName: normalizeString(data.targetAccountName, 200),
        targetAccountEmail: normalizeString(data.targetAccountEmail, 200),
        targetRole: normalizeString(data.targetRole, 64),
        metadata:
          typeof data.metadata === 'object' && data.metadata !== null
            ? (data.metadata as Record<string, unknown>)
            : undefined,
        ipAddress: normalizeString(data.ipAddress ?? data.ip, 120),
        forwardedFor: normalizeString(data.forwardedFor, 500),
        userAgent: normalizeString(data.userAgent, 500),
        country,
        region,
        city,
        location,
        requestPath: normalizeString(data.requestPath, 200),
        requestMethod: normalizeString(data.requestMethod, 16),
        createdAt: toIsoString(data.createdAt) || toIsoString(data.timestamp),
      };
    }),
  );
}
