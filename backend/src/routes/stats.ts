import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';

const router = Router();
const DEFAULT_APPOINTMENT_PRICE = env.paywallAmountUsd;

function toMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }
  const date = new Date(trimmed);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const raw = typeof value === 'string' ? value.trim() : '';
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function normalizeMedicineName(raw: string): { key: string; label: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Keep this intentionally conservative to avoid accidental over-merging.
  // Example: "Paracetamol 500mg" -> "paracetamol"
  let cleaned = trimmed
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(mg|g|mcg|µg|ug|ml|iu)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) cleaned = trimmed;
  const key = cleaned.toLowerCase();
  const label = cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return { key, label: label || cleaned };
}

router.get('/admin', requireAuth([UserRole.Admin]), async (_req: AuthenticatedRequest, res) => {
  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const [appointmentsSnap, prescriptionsSnap, clinicsSnap, usersSnap] = await Promise.all([
      db.collection('appointments').get(),
      db.collection('recipe').get(),
      db.collection('clinicBookings').get(),
      db.collection('users').get(),
    ]);

    const totalAppointments = appointmentsSnap.size;
    const totalRecipes = prescriptionsSnap.size;
    const totalClinicBookings = clinicsSnap.size;
    const totalUsers = usersSnap.size;

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const monthlyRevenue = appointmentsSnap.docs.reduce((sum, doc) => {
      const data = doc.data() as { isPaid?: boolean; preferredDate?: string };
      if (!data.isPaid || !data.preferredDate) return sum;
      const date = new Date(data.preferredDate);
      if (date >= monthStart && date < nextMonthStart) {
        return sum + DEFAULT_APPOINTMENT_PRICE;
      }
      return sum;
    }, 0);

    res.json({
      totalAppointments,
      totalRecipes,
      totalClinicBookings,
      totalUsers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Failed to load admin stats', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/admin/medicine-usage', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();

    const limit = Math.min(200, Math.max(1, parsePositiveInt(req.query.limit, 50)));
    const maxDocs = Math.min(50_000, Math.max(500, parsePositiveInt(req.query.maxDocs, 5000)));
    const pageSize = 500;

    const now = Date.now();
    const days = parsePositiveInt(req.query.days, 30);
    const fromMs = toMs(req.query.from) ?? (days > 0 ? now - days * 24 * 60 * 60 * 1000 : null);
    const toMsValue = toMs(req.query.to) ?? now;

    type RecipeDoc = { medicines?: unknown; createdAt?: unknown };

    let baseQuery: FirebaseFirestore.Query = db.collection('recipe').orderBy('createdAt', 'desc');
    if (fromMs !== null) baseQuery = baseQuery.where('createdAt', '>=', fromMs);
    if (toMsValue !== null) baseQuery = baseQuery.where('createdAt', '<', toMsValue);

    const counts = new Map<string, { label: string; count: number }>();
    let scanned = 0;
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

    while (scanned < maxDocs) {
      const pagedQuery: FirebaseFirestore.Query = (lastDoc ? baseQuery.startAfter(lastDoc) : baseQuery).limit(pageSize);
      const snapshot: FirebaseFirestore.QuerySnapshot = await pagedQuery.get();
      if (snapshot.empty) break;

      for (const doc of snapshot.docs) {
        scanned += 1;
        const data = doc.data() as RecipeDoc;
        const meds = data.medicines;
        if (!Array.isArray(meds)) continue;
        for (const raw of meds) {
          if (typeof raw !== 'string') continue;
          const normalized = normalizeMedicineName(raw);
          if (!normalized) continue;
          const current = counts.get(normalized.key);
          if (current) {
            current.count += 1;
          } else {
            counts.set(normalized.key, { label: normalized.label, count: 1 });
          }
        }
        if (scanned >= maxDocs) break;
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
      if (!lastDoc) break;
      if (snapshot.size < pageSize) break;
    }

    const top = Array.from(counts.entries())
      .map(([key, value]) => ({ key, label: value.label, count: value.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.json({
      range: { from: fromMs, to: toMsValue, days: days || null },
      scannedRecipes: scanned,
      uniqueMedicines: counts.size,
      top,
    });
  } catch (error) {
    console.error('Failed to load medicine usage stats', error);
    res.status(500).json({ error: 'Failed to load medicine usage stats' });
  }
});

export default router;
